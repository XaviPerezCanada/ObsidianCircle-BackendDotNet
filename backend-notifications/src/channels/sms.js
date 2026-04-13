'use strict';

const URGENCY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };
const SMS_MAX_CHARS = 160;

/**
 * Simula el envío de un SMS imprimiéndolo en consola.
 * Trunca automáticamente a 160 caracteres si la IA excede el límite.
 */
function send(notification, message) {
  const ts = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  const urg = notification.urgency || 'medium';
  const data = _safeJson(notification.data);
  const recipient = data.usuario || 'Socio';

  // Sanitize: quitar saltos de línea extra y emojis frecuentes en SMS real
  let sms = message.replace(/\n+/g, ' ').trim();
  if (sms.length > SMS_MAX_CHARS) {
    sms = sms.substring(0, SMS_MAX_CHARS - 3) + '...';
  }

  const line = '─'.repeat(62);
  console.log('\n' + line);
  console.log(`💬  SMS        ${URGENCY_EMOJI[urg]} ${urg.toUpperCase()}   →  ${recipient}   [${ts}]`);
  console.log(line);
  console.log(sms);
  console.log(`\n[${sms.length}/${SMS_MAX_CHARS} caracteres]`);
  console.log(line + '\n');
}

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}

module.exports = { send };
