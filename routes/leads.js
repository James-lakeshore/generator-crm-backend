const express = require('express');
const Lead = require('../models/Lead');
const { notifyNewLead } = require('../utils/notify');
const router = express.Router();

// POST /api/leads
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body || {};
    const lead = await Lead.create({
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
      address: payload.address || '',
      serviceAmps: payload.serviceAmps || '',
      fuel: payload.fuel || '',
      notes: payload.notes || '',
      source: payload.source || 'manual',
      utm: payload.utm || {},
    });
    // Fire-and-forget notifications (don't block response)
    notifyNewLead(lead).catch(console.error);
    res.status(201).json({ ok: true, lead });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
