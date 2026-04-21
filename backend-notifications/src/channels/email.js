'use strict';

const { Resend } = require('resend');

const URGENCY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Envía un Email real via Resend si RESEND_API_KEY está configurada.
 * Sin la key, imprime en consola (modo dev/fallback).
 */
async function send(notification, message) {
  const ts = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  const urg = notification.urgency || 'medium';
  const data = _safeJson(notification.data);

  const recipientName = data.usuario || 'Socio';
  const recipientEmail = "xaviperezcanada1@gmail.com" //data.email || data.usuario_email || data._auth_user_email || null;

  const lines = message.split('\n');
  const subjectLine = lines.find((l) => l.toLowerCase().startsWith('asunto:')) || 'Asunto: Notificación importante';
  const subject = subjectLine.replace(/^asunto:\s*/i, '').trim();
  const body = lines.filter((l) => !l.toLowerCase().startsWith('asunto:')).join('\n').trimStart();

  if (resend && recipientEmail) {
    const from = process.env.RESEND_FROM_EMAIL || 'notificaciones@tudominio.com';
    const { error } = await resend.emails.send({
      from,
      to: recipientEmail,
      subject,
      text: body,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`📧  EMAIL enviado via Resend  ${URGENCY_EMOJI[urg]} ${urg.toUpperCase()}  →  ${recipientEmail}  [${ts}]`);
    return;
  }

  // Fallback a consola cuando no hay API key o no hay email de destinatario
  const toAddress = recipientEmail || `${recipientName.toLowerCase()}@empresa.com`;
  const line = '─'.repeat(62);
  console.log('\n' + line);
  console.log(`📧  EMAIL (dev)  ${URGENCY_EMOJI[urg]} ${urg.toUpperCase()}   →  ${recipientName}   [${ts}]`);
  if (!resend) console.log('    ⚠️  RESEND_API_KEY no configurada — email simulado');
  if (!recipientEmail) console.log('    ⚠️  Sin email de destinatario en notification.data — email simulado');
  console.log(line);
  console.log(`De:      ${process.env.RESEND_FROM_EMAIL || 'sistema-notificaciones@empresa.com'}`);
  console.log(`Para:    ${toAddress}`);
  console.log(`Asunto:  ${subject}`);
  console.log(line);
  console.log(body);
  console.log(line + '\n');
}

function _safeJson(str) {
  try { return JSON.parse(str || '{}'); } catch { return {}; }
}

module.exports = { send };
