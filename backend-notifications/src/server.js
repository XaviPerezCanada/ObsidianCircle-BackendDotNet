'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { initDb, enqueueNotification, getStats, getAllNotifications, getNotificationById } = require('./db');
const { determineUrgency, getAvailableProviders } = require('./aiGateway');
const { startWorker } = require('./worker');
const { requireAuth } = require('./middleware/auth');

const app = express();

// ─── CORS — permite React (5173) y cualquier origen en dev ───────────────────
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Permitir llamadas sin origin (Postman, curl, backend-to-backend)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado: origen no permitido → ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);
const WORKER_INTERVAL = parseInt(process.env.WORKER_INTERVAL_MS || '5000', 10);

// ─────────────────────────────────────────────────────────────────────────────
// GET /status  — Health check
// ─────────────────────────────────────────────────────────────────────────────

app.get('/status', (req, res) => {
  const stats = getStats();
  const providers = getAvailableProviders();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai_gateway: {
      mode: providers.length === 0 ? 'mock' : 'live',
      active_providers: providers.map((p) => p.name),
      total_providers_available: providers.length,
    },
    queue: {
      total: stats.total || 0,
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      processed: stats.processed || 0,
      failed: stats.failed || 0,
    },
    worker: {
      interval_ms: WORKER_INTERVAL,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /enqueue-notification  [🔒 requiere JWT]
// ─────────────────────────────────────────────────────────────────────────────

app.post('/enqueue-notification', requireAuth, async (req, res) => {
  const { task_description, channels, tone, data } = req.body;

  // Inyectar automáticamente los datos del usuario autenticado
  const enrichedData = {
    ...data,
    _auth_user_id:    req.user.sub,
    _auth_user_email: req.user.email,
    _auth_user_name:  req.user.name,
    // Mantener 'usuario' si viene en el body, si no usar el del token
    usuario: data?.usuario || req.user.name || req.user.email,
  };

  // Validaciones
  if (!task_description || typeof task_description !== 'string') {
    return res.status(400).json({ error: 'task_description es requerido y debe ser un string' });
  }
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({ error: 'channels[] es requerido y no puede estar vacío' });
  }

  const VALID_CHANNELS = ['WhatsApp', 'Email', 'SMS'];
  const invalidChannels = channels.filter((c) => !VALID_CHANNELS.includes(c));
  if (invalidChannels.length > 0) {
    return res.status(400).json({
      error: `Canales inválidos: [${invalidChannels.join(', ')}]. Válidos: [${VALID_CHANNELS.join(', ')}]`,
    });
  }

  console.log(`\n📥 [API] Enqueue → "${task_description.substring(0, 70)}..."`);
  console.log(`   Canales: ${channels.join(', ')} | Tono: ${tone || 'Profesional'}`);

  try {
    // 1. Determinar urgencia con IA
    const { urgency, reason, provider } = await determineUrgency(task_description, data || {});
    console.log(`   → Urgencia: ${urgency.toUpperCase()} (${reason}) [${provider}]`);

    // 2. Guardar en DB como pending
    const id = enqueueNotification({
      task_description,
      channels,
      tone: tone || 'Profesional y directo',
      data: enrichedData,
      urgency,
      urgency_reason: reason,
      urgency_provider: provider,
    });

    // 3. Responder con éxito
    res.status(201).json({
      id,
      status: 'pending',
      urgency,
      urgency_reason: reason,
      urgency_provider: provider,
      channels,
      message: `Notificación encolada con ID ${id}. El worker la procesará en los próximos ${WORKER_INTERVAL / 1000}s.`,
    });
  } catch (err) {
    console.error(`❌ [API] Error al encolar: ${err.message}`);
    res.status(500).json({ error: `Error interno: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /notifications[?status=pending|processed|failed]  [🔒 requiere JWT]
// ─────────────────────────────────────────────────────────────────────────────

app.get('/notifications', requireAuth, (req, res) => {
  const { status } = req.query;
  const validStatuses = ['pending', 'processing', 'processed', 'failed'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `status inválido: "${status}". Valores válidos: ${validStatuses.join(', ')}`,
    });
  }

  const notifications = getAllNotifications(status);
  res.json({ count: notifications.length, notifications });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /notifications/:id  [🔒 requiere JWT]
// ─────────────────────────────────────────────────────────────────────────────

app.get('/notifications/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID debe ser un número entero' });

  const notification = getNotificationById(id);
  if (!notification) return res.status(404).json({ error: `Notificación ID ${id} no encontrada` });

  // Parsear channels y data para mayor comodidad
  res.json({
    ...notification,
    channels: _safeJson(notification.channels),
    data: _safeJson(notification.data),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Arrancar servidor + worker (async para esperar initDb)
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  // Inicializar la base de datos antes de arrancar
  await initDb();

  app.listen(PORT, () => {
    const providers = getAvailableProviders();
    const bar = '═'.repeat(62);

    console.log('\n' + bar);
    console.log('🚀  AI Notifications Gateway');
    console.log(bar);
    console.log(`📡  URL      : http://localhost:${PORT}`);
    console.log(`🤖  IA Mode  : ${providers.length === 0 ? '🎭 MOCK (sin API keys)' : '✅ LIVE'}`);
    if (providers.length > 0) {
      console.log(`   Providers : ${providers.map((p) => p.name).join(' → ')}`);
    }
    const authMode = process.env.JWT_SECRET
      ? `🔒 JWT activo (Issuer: ${process.env.JWT_ISSUER || 'any'})`
      : '⚠️  Sin JWT_SECRET — modo dev sin auth';
    console.log(`🔑  Auth     : ${authMode}`);
    console.log(`🌐  CORS     : ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(bar);
    console.log('📌  Endpoints disponibles:');
    console.log(`    GET  http://localhost:${PORT}/status`);
    console.log(`    POST http://localhost:${PORT}/enqueue-notification`);
    console.log(`    GET  http://localhost:${PORT}/notifications`);
    console.log(`    GET  http://localhost:${PORT}/notifications/:id`);
    console.log(bar + '\n');

    startWorker(WORKER_INTERVAL);
  });
})();


// ─────────────────────────────────────────────────────────────────────────────

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}
