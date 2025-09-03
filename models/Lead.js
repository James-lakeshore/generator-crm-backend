const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  serviceAmps: { type: String, trim: true },
  fuel: { type: String, trim: true },
  notes: { type: String, trim: true },
  source: { type: String, trim: true },
  utm: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
