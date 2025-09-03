const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');
  await mongoose.connect(uri, { });
  console.log('Connected to MongoDB');
}

module.exports = { connectMongo };
