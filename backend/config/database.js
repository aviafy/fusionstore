const mongoose = require('mongoose');

const DEFAULT_DB_NAME = 'fusion-commerce';
const DEFAULT_URI = `mongodb://127.0.0.1:27017/${DEFAULT_DB_NAME}`;

function getFallbackDbName() {
  return (process.env.MONGO_DB_NAME || DEFAULT_DB_NAME).trim();
}

function normalizeMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname.replace(/^\/+/, '');
    if (dbName) return uri;

    const fallbackDbName = getFallbackDbName();
    if (!fallbackDbName) return uri;

    parsed.pathname = `/${fallbackDbName}`;
    return parsed.toString();
  } catch {
    return uri;
  }
}

function getMongoUri() {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || DEFAULT_URI;
  return normalizeMongoUri(rawUri);
}

function getMongoDbName(uri = getMongoUri()) {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\/+/, '') || getFallbackDbName();
  } catch {
    return getFallbackDbName();
  }
}

async function connectDB(uri = getMongoUri()) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDB, disconnectDB, getMongoUri, getMongoDbName };
