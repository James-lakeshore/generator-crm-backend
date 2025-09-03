/* Lakeshore Power CRM API */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectMongo } = require('./utils/db');
const leadsRouter = require('./routes/leads');
const webhooksRouter = require('./routes/webhooks');

const app = express();

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin, credentials: false }));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// Routes
app.use('/api/leads', leadsRouter);
app.use('/webhooks', webhooksRouter);

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;

// Start
connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
