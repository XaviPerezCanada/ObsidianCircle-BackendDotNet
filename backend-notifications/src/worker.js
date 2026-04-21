'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { getOldestPending, setStatus } = require('./db');
const { generateChannelMessage } = require('./aiGateway');
const whatsapp = require('./channels/whatsapp');
const email = require('./channels/email');
const sms = require('./channels/sms');

// Mapa de canal → handler
const CHANNEL_HANDLERS = {
  WhatsApp: whatsapp,
  Email: email,
  SMS: sms,
};

// ─────────────────────────────────────────────────────────────────────────────
// Procesador de una notificación
// ─────────────────────────────────────────────────────────────────────────────

async function processNextNotification() {
  const notification = getOldestPending();
  if (!notification) return; // Cola vacía — no hay nada que hacer

  console.log(`\n⚙️  [Worker] ━━━ Procesando notificación ID: ${notification.id} ━━━`);
  console.log(`   Tarea   : ${notification.task_description.substring(0, 80)}${notification.task_description.length > 80 ? '...' : ''}`);
  console.log(`   Urgencia: ${notification.urgency.toUpperCase()} — ${notification.urgency_reason}`);
  console.log(`   Canales : ${JSON.parse(notification.channels).join(', ')}`);
  console.log(`   Tono    : ${notification.tone}\n`);

  // Marcar como "processing" para evitar que otro worker lo coja (si hubiese)
  setStatus(notification.id, 'processing');

  const channels = JSON.parse(notification.channels);
  const data = _safeJson(notification.data);

  try {
    for (const channel of channels) {
      console.log(`📤 [Worker] Generando mensaje para → ${channel}...`);

      const { message, provider } = await generateChannelMessage(
        channel,
        notification.task_description,
        notification.tone,
        data,
        notification.urgency
      );

      console.log(`   ✓ Generado por: ${provider}`);

      const handler = CHANNEL_HANDLERS[channel];
      if (handler) {
        await handler.send(notification, message);
      } else {
        console.warn(`⚠️  [Worker] Canal desconocido: "${channel}" — saltando`);
      }
    }

    // Todos los canales OK → marcar como procesado
    setStatus(notification.id, 'processed');
    console.log(`✅ [Worker] Notificación ID ${notification.id} → PROCESSED\n`);
  } catch (err) {
    setStatus(notification.id, 'failed', { error_log: err.message });
    console.error(`❌ [Worker] Error en notificación ID ${notification.id}: ${err.message}\n`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bucle de polling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Arranca el worker con un intervalo de polling configurable.
 * @param {number} intervalMs  Milisegundos entre comprobaciones (default: 5000)
 */
function startWorker(intervalMs = 5000) {
  console.log(`🔄 [Worker] Iniciado. Polling cada ${intervalMs / 1000}s...`);

  // Primera ejecución inmediata (por si hay notificaciones pendientes al arrancar)
  processNextNotification().catch((err) =>
    console.error(`❌ [Worker] Error inesperado: ${err.message}`)
  );

  setInterval(async () => {
    try {
      await processNextNotification();
    } catch (err) {
      console.error(`❌ [Worker] Error inesperado en tick: ${err.message}`);
    }
  }, intervalMs);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}

module.exports = { startWorker, processNextNotification };
