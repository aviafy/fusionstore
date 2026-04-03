const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDatabase } = require('../utils/seedDatabase');

process.env.JWT_SECRET = process.env.JWT_SECRET || '0123456789abcdef0123456789abcdef';
process.env.NODE_ENV = 'test';

jest.setTimeout(120000);

beforeAll(async () => {
  if (process.env.MONGO_URI_TEST) {
    process.env.MONGO_URI = process.env.MONGO_URI_TEST;
  } else {
    global.__MONGO_SERVER__ = await MongoMemoryServer.create({
      binary: {
        downloadDir: path.join(__dirname, '../.mongo-binaries'),
      },
    });
    process.env.MONGO_URI = global.__MONGO_SERVER__.getUri();
  }

  await mongoose.connect(process.env.MONGO_URI);
  await seedDatabase();
  global.__APP__ = require('../index');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
});
