require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitizeLib = require('express-mongo-sanitize');

const { connectDB, getMongoUri, getMongoDbName } = require('./config/database');
const { seedDatabase } = require('./utils/seedDatabase');
const { seedAdminUser } = require('./utils/seedAdmin');

const freelancerServicesRoutes = require('./routes/freelancerServices');
const freelancerContactRoutes = require('./routes/freelancerContact');
const checkoutRoutes = require('./routes/checkout');
const { stripeWebhookHandler } = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const nftRoutes = require('./routes/nfts');
const loggerHelper = require('./utils/logger.helper');
const metamaskRoutes = require('./routes/metamask');
const authRoutes = require('./routes/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { setupSwaggerUi, setupSwaggerJson } = require('./docs/swagger');

const productsRoutes = require('./routes/products');
const searchRoutes = require('./routes/search');

const app = express();
// Default 5050: macOS often binds AirPlay Receiver to 5000, which returns 403 and breaks the Vite proxy.
const PORT = process.env.PORT || 5050;

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(
  helmet({
    // Disable CSP in development so local Vite + API docs are easier to debug; enable defaults in production.
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  })
);

app.use(
  cors({
    origin: clientOrigins.length ? clientOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(hpp());
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req.body = mongoSanitizeLib.sanitize(req.body, { replaceWith: '_' });
  }
  next();
});
app.use(loggerHelper.logRequest);

app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '7d',
  immutable: true,
}));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

setupSwaggerJson(app);
setupSwaggerUi(app);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/freelancer-services', freelancerServicesRoutes);
app.use('/api/freelancer-contact', freelancerContactRoutes);
app.use('/api/nfts', nftRoutes);
app.use('/api/checkout', checkoutLimiter, checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/metamask', metamaskRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  const uri = getMongoUri();
  console.log('Connecting to MongoDB...');
  await connectDB(uri);
  const summary = await seedDatabase();
  console.log('Seed summary:', summary);
  await seedAdminUser();
  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0');
  app.listen(PORT, host, () => {
    console.log(`Server ready on http://${host}:${PORT}`);
    console.log(`MongoDB database: ${getMongoDbName(uri)}`);
    console.log(`MongoDB: ${uri.replace(/\/\/.*@/, '//***@')}`);
  });
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
