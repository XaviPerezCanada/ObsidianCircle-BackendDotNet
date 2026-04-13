'use strict';

const URGENCY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

/**
 * Simula el envío de un Email imprimiéndolo en consola.
 * El mensaje generado por la IA debe incluir "Asunto: ..." en la primera línea.
 */
function send(notification, message) {
  const ts = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  const urg = notification.urgency || 'medium';
  const data = _safeJson(notification.data);
  const recipient = data.usuario || 'Socio';

  const lines = message.split('\n');
  const subjectLine = lines.find((l) => l.toLowerCase().startsWith('asunto:')) || 'Asunto: Notificación importante';
  const body = lines.filter((l) => !l.toLowerCase().startsWith('asunto:')).join('\n').trimStart();

  const line = '─'.repeat(62);
  console.log('\n' + line);
  console.log(`📧  EMAIL      ${URGENCY_EMOJI[urg]} ${urg.toUpperCase()}   →  ${recipient}   [${ts}]`);
  console.log(line);
  console.log(`De:      sistema-notificaciones@empresa.com`);
  console.log(`Para:    ${recipient.toLowerCase()}@empresa.com`);
  console.log(subjectLine);
  console.log(line);
  console.log(body);
  console.log(line + '\n');
}

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}

module.exports = { send };
