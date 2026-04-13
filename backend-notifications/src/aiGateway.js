'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fetch = require('node-fetch');

// ─────────────────────────────────────────────────────────────────────────────
// Definición de proveedores IA (todos tier gratuito)
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    call: async (apiKey, messages) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
  {
    name: 'Cerebras',
    envKey: 'CEREBRAS_API_KEY',
    call: async (apiKey, messages) => {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Cerebras HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
  {
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    call: async (apiKey, messages) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Notifications Gateway',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
  {
    name: 'Gemini',
    envKey: 'GEMINI_API_KEY',
    call: async (apiKey, messages) => {
      // Convertir mensajes al formato de Gemini
      const systemMsg = messages.find((m) => m.role === 'system');
      const chatMessages = messages.filter((m) => m.role !== 'system');

      const contents = chatMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Inyectar system prompt en el primer user message
      if (systemMsg && contents.length > 0) {
        contents[0].parts[0].text = `[INSTRUCCIONES SISTEMA]\n${systemMsg.content}\n\n${contents[0].parts[0].text}`;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    },
  },
  {
    name: 'Mistral',
    envKey: 'MISTRAL_API_KEY',
    call: async (apiKey, messages) => {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Mistral HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
  {
    name: 'Cohere',
    envKey: 'COHERE_API_KEY',
    call: async (apiKey, messages) => {
      // Cohere v2 — acepta el mismo formato de messages que OpenAI
      const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus-08-2024',
          messages,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Cohere HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.message.content[0].text;
    },
  },
  {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    call: async (apiKey, messages) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI HTTP ${res.status}: ${err.substring(0, 200)}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Round-robin state (persiste durante la vida del proceso)
// ─────────────────────────────────────────────────────────────────────────────

let currentIndex = 0;

/** Devuelve solo los proveedores que tienen API key configurada */
function getAvailableProviders() {
  return PROVIDERS.filter(
    (p) => process.env[p.envKey] && process.env[p.envKey].trim() !== ''
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Motor de llamadas con rotación + fallback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Llama al siguiente proveedor disponible (round-robin).
 * Si falla, intenta el siguiente. Si todos fallan, usa mock.
 * @param {Array} messages  Array de { role, content }
 * @returns {{ result: string, provider: string }}
 */
async function callAI(messages) {
  const available = getAvailableProviders();

  if (available.length === 0) {
    console.log('🎭 [AI Gateway] Sin providers activos → modo MOCK');
    return { result: _mockResponse(messages), provider: 'Mock' };
  }

  for (let attempt = 0; attempt < available.length; attempt++) {
    const idx = (currentIndex + attempt) % available.length;
    const provider = available[idx];
    const apiKey = process.env[provider.envKey];

    try {
      console.log(`🤖 [AI Gateway] Intentando: ${provider.name}`);
      const result = await provider.call(apiKey, messages);
      // Avanzar el índice para la próxima llamada (round-robin)
      currentIndex = (idx + 1) % available.length;
      return { result, provider: provider.name };
    } catch (err) {
      console.warn(`⚠️  [AI Gateway] ${provider.name} falló → ${err.message}`);
    }
  }

  // Todos fallaron
  console.warn('⚠️  [AI Gateway] Todos los proveedores fallaron → usando Mock');
  return { result: _mockResponse(messages), provider: 'Mock (fallback)' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Respuesta mock (cuando no hay providers o todos fallan)
// ─────────────────────────────────────────────────────────────────────────────

function _mockResponse(messages) {
  // Distinguir por el system prompt: urgencia vs generación de mensaje
  const systemContent = messages.find((m) => m.role === 'system')?.content || '';
  const isUrgencyRequest = systemContent.toLowerCase().includes('clasificación de urgencias');

  if (isUrgencyRequest) {
    return JSON.stringify({
      urgency: 'medium',
      reason: 'Situación que requiere atención pero no es crítica. [Respuesta Mock]',
    });
  }

  // Detectar el canal del user message para personalizar el mock
  const userContent = messages.find((m) => m.role === 'user')?.content || '';
  if (userContent.includes('Canal: WhatsApp')) {
    return '👋 Hola Xavi, te informamos de que se ha encontrado el tablero montado en la sala. ¿Puedes pasarte a recogerlo cuando puedas? ¡Gracias! 🎲 [Mock]';
  }
  if (userContent.includes('Canal: Email')) {
    return 'Asunto: Tablero de juego encontrado en la sala de reuniones\n\nEstimado Xavi,\n\nQueríamos informarte de que el tablero de mesa ha aparecido montado en la sala. Te rogamos que lo recojas en cuanto sea posible.\n\nGracias por tu atención.\n\nUn cordial saludo,\nEquipo de Gestión [Mock]';
  }
  if (userContent.includes('Canal: SMS')) {
    return 'Xavi: tablero encontrado en sala. Por favor recógelo. Gracias. [Mock]';
  }

  return (
    'Estimado socio,\n\n' +
    'Le informamos de la situación registrada y le pedimos que tome las medidas oportunas.\n\n' +
    'Quedamos a su disposición para cualquier consulta.\n\n' +
    'Un cordial saludo. [Mensaje Mock — configure una API key en .env]'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública del gateway
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determina la urgencia de una tarea usando IA.
 * @returns {{ urgency: string, reason: string, provider: string }}
 */
async function determineUrgency(taskDescription, data) {
  const messages = [
    {
      role: 'system',
      content: `Eres un sistema de clasificación de urgencias para notificaciones empresariales.
Analiza la situación y devuelve ÚNICAMENTE un JSON válido con este formato exacto:
{"urgency": "low|medium|high|critical", "reason": "explicación breve en español"}

Criterios de urgencia:
- critical: riesgo inmediato, seguridad, pérdida grave → acción en minutos
- high: problema importante → acción en menos de 1 hora
- medium: requiere atención hoy
- low: informativo, sin prisa`,
    },
    {
      role: 'user',
      content: `Situación: ${taskDescription}
Datos adicionales: ${JSON.stringify(data)}

Determina la urgencia:`,
    },
  ];

  const { result, provider } = await callAI(messages);

  try {
    const jsonMatch = result.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('No JSON en respuesta');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      urgency: ['low', 'medium', 'high', 'critical'].includes(parsed.urgency)
        ? parsed.urgency
        : 'medium',
      reason: parsed.reason || 'Sin razón especificada',
      provider,
    };
  } catch {
    return { urgency: 'medium', reason: 'No se pudo parsear la urgencia', provider };
  }
}

/**
 * Genera el texto de notificación adaptado a un canal específico.
 * @returns {{ message: string, provider: string }}
 */
async function generateChannelMessage(channel, taskDescription, tone, data, urgency) {
  const channelGuides = {
    WhatsApp:
      'Mensaje de WhatsApp: tono cercano, máximo 3 párrafos cortos. Puedes usar emojis con moderación. Sin asunto.',
    Email:
      'Email profesional: primera línea debe ser "Asunto: <título descriptivo>", luego una línea en blanco, luego el cuerpo completo con saludo, desarrollo y firma.',
    SMS: 'SMS: máximo 160 caracteres. Directo, sin emojis, sin saludo largo.',
  };

  const urgencyES = { low: 'BAJA', medium: 'MEDIA', high: 'ALTA', critical: 'CRÍTICA' };

  const messages = [
    {
      role: 'system',
      content: `Eres un redactor experto en comunicaciones empresariales.
Genera mensajes precisos y adaptados al canal y tono indicados.
Responde ÚNICAMENTE con el texto del mensaje, sin explicaciones adicionales.`,
    },
    {
      role: 'user',
      content: `Canal: ${channel}
Formato/reglas del canal: ${channelGuides[channel] || 'Mensaje estándar.'}
Tono requerido: ${tone}
Nivel de urgencia: ${urgencyES[urgency] || urgency}
Situación: ${taskDescription}
Datos del contexto: ${JSON.stringify(data)}

Genera el mensaje:`,
    },
  ];

  const { result, provider } = await callAI(messages);
  return { message: result.trim(), provider };
}

module.exports = { determineUrgency, generateChannelMessage, getAvailableProviders };
