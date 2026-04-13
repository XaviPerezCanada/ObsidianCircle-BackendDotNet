'use strict';

const URGENCY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

/**
 * Simula el envío de un mensaje de WhatsApp imprimiéndolo en consola.
 * @param {object} notification  Fila completa de la DB
 * @param {string} message       Texto generado por la IA
 */
function send(notification, message) {
  const ts = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  const urg = notification.urgency || 'medium';
  const data = _safeJson(notification.data);
  const recipient = data.usuario || 'Socio';

  const line = '─'.repeat(62);
  console.log('\n' + line);
  console.log(`📱  WHATSAPP   ${URGENCY_EMOJI[urg]} ${urg.toUpperCase()}   →  ${recipient}   [${ts}]`);
  console.log(line);
  console.log(message);
  console.log(line + '\n');
}

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}

module.exports = { send };
