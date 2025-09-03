const express = require('express');
const Lead = require('../models/Lead');
const { notifyNewLead } = require('../utils/notify');

const router = express.Router();

// Simple secret check via header
function checkSecret(req) {
  const secret = process.env.TALLY_WEBHOOK_SECRET;
  if (!secret) return true; // if not set, accept (dev mode)
  const provided = req.get('x-webhook-secret') || req.get('x-tally-secret') || req.query.secret;
  return provided === secret;
}

// Tally webhook: POST /webhooks/tally
router.post('/tally', async (req, res, next) => {
  try {
    if (!checkSecret(req)) return res.status(401).json({ error: 'Invalid webhook secret' });

    const b = req.body || {};
    // Try to map common Tally payload fields. Adjust as needed.
    const lead = await Lead.create({
      name: b.name || b.full_name || `${b.first_name || ''} ${b.last_name || ''}`.trim(),
      email: b.email || b.email_address || '',
      phone: b.phone || b.phone_number || '',
      address: b.address || b.street || '',
      serviceAmps: b.serviceAmps || b.service_amps || '',
      fuel: b.fuel || b.fuel_type || '',
      notes: b.notes || b.message || '',
      source: 'tally',
      utm: b.utm || b.utm_params || {},
    });

    notifyNewLead(lead).catch(console.error);
    res.json({ ok: true, id: lead._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
