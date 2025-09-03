const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const twilio = require('twilio');

function hasResend() { return !!process.env.RESEND_API_KEY; }
function hasSMTP() { return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS); }
function hasTwilio() { return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER && process.env.ALERT_TO_NUMBER); }

async function sendEmail(subject, html) {
  if (hasResend()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM || 'no-reply@example.com';
      const to = process.env.EMAIL_TO || from;
      await resend.emails.send({ from, to, subject, html });
      return;
    } catch (e) { console.error('Resend error', e); }
  }
  if (hasSMTP()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
      const to = process.env.EMAIL_TO || from;
      await transporter.sendMail({ from, to, subject, html });
      return;
    } catch (e) { console.error('SMTP error', e); }
  }
  console.log('Email disabled (no RESEND_API_KEY or SMTP settings). Subject:', subject);
}

async function sendSMS(body) {
  if (!hasTwilio()) { console.log('SMS disabled (no Twilio env).'); return; }
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to: process.env.ALERT_TO_NUMBER, body });
  } catch (e) { console.error('Twilio error', e); }
}

function htmlEscape(s){ return String(s || '').replace(/[&<>"']/g, (c)=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }

async function notifyNewLead(lead) {
  const subject = `New Lead: ${lead.name || 'Unknown'} (${lead.phone || lead.email || ''})`;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <h2>New Lead Received</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><td><b>Name</b></td><td>${htmlEscape(lead.name)}</td></tr>
        <tr><td><b>Email</b></td><td>${htmlEscape(lead.email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${htmlEscape(lead.phone)}</td></tr>
        <tr><td><b>Address</b></td><td>${htmlEscape(lead.address)}</td></tr>
        <tr><td><b>Service Amps</b></td><td>${htmlEscape(lead.serviceAmps)}</td></tr>
        <tr><td><b>Fuel</b></td><td>${htmlEscape(lead.fuel)}</td></tr>
        <tr><td><b>Notes</b></td><td>${htmlEscape(lead.notes)}</td></tr>
        <tr><td><b>Source</b></td><td>${htmlEscape(lead.source)}</td></tr>
      </table>
      <p style="color:#666">Lead ID: ${lead._id} • ${new Date(lead.createdAt).toISOString()}</p>
    </div>`;
  await sendEmail(subject, html);

  const sms = `New Lead: ${lead.name || ''} ${lead.phone || ''} ${lead.email || ''}`.trim();
  await sendSMS(sms);
}

module.exports = { notifyNewLead };
