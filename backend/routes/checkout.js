const express = require('express');
const crypto = require('crypto');
const Product = require('../models/product');
const Order = require('../models/order');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const STATUS_FLOW = Order.STATUS_FLOW || [];
const FREE_SHIPPING_THRESHOLD = 99;
const STANDARD_SHIPPING = 9.99;
const CARD_MIN_AMOUNT_CENTS = 50;
const VALID_CRYPTO_CURRENCIES = new Set(['BTC', 'ETH', 'USDC', 'USDT']);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateOrderNumber() {
  const hex = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  return `FE-${hex.slice(0, 12)}`;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // eslint-disable-next-line global-require
  return require('stripe')(key);
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function normalizeCustomerFields({ name, email, shippingAddress }) {
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedAddress = String(shippingAddress || '').trim();

  if (!trimmedName || !trimmedAddress) {
    const error = new Error('Name and shipping address are required.');
    error.status = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }

  if (!emailRegex.test(trimmedEmail)) {
    const error = new Error('Invalid email format');
    error.status = 400;
    error.code = 'INVALID_EMAIL';
    throw error;
  }

  return {
    name: trimmedName,
    email: trimmedEmail,
    shippingAddress: trimmedAddress,
  };
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Order must include at least one item.');
    error.status = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }

  const merged = new Map();

  for (const item of items) {
    const productId = item?.productId || item?.id;
    const quantity = Number(item?.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      const error = new Error('Invalid product reference or quantity in order payload.');
      error.status = 400;
      error.code = 'INVALID_ITEM';
      throw error;
    }

    const normalizedProductId = String(productId);
    merged.set(normalizedProductId, (merged.get(normalizedProductId) || 0) + quantity);
  }

  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

async function loadValidatedProducts(normalizedItems) {
  const productIds = normalizedItems.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    const error = new Error('One or more products are no longer available.');
    error.status = 400;
    error.code = 'PRODUCT_GONE';
    throw error;
  }

  const productMap = new Map(products.map(product => [String(product._id), product]));

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);
    if (!product || product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${product?.name || item.productId}.`);
      error.status = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }
  }

  return productMap;
}

function buildOrderItems(normalizedItems, productMap) {
  return normalizedItems.map(item => {
    const product = productMap.get(item.productId);
    return {
      productId: String(product._id),
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    };
  });
}

function calculatePricing(orderItems) {
  const subtotal = roundCurrency(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = roundCurrency(subtotal + shippingCost);

  return {
    subtotal,
    shippingCost,
    total,
    currency: 'usd',
  };
}

function buildEstimatedDelivery() {
  return new Date(Date.now() + (2 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000);
}

function serializeOrderResponse(order, extras = {}) {
  return {
    orderNumber: order.orderNumber,
    estimatedDelivery: order.estimatedDelivery,
    statusHistory: order.statusHistory,
    statusFlow: STATUS_FLOW,
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    currency: order.currency,
    paymentMethod: order.paymentInfo?.method || extras.paymentMethod || 'card',
    paymentStatus: order.paymentStatus,
    ...extras,
  };
}

/**
 * POST /api/checkout/create-payment-intent
 * Creates a pending order and Stripe PaymentIntent (USD card via Elements).
 */
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: 'Card payments are not configured (missing STRIPE_SECRET_KEY).',
        code: 'STRIPE_UNAVAILABLE',
      });
    }

    const { items, name, email, shippingAddress } = req.body || {};
    const customer = normalizeCustomerFields({ name, email, shippingAddress });
    const normalizedItems = normalizeItems(items);
    const productMap = await loadValidatedProducts(normalizedItems);
    const orderItems = buildOrderItems(normalizedItems, productMap);
    const pricing = calculatePricing(orderItems);
    const amountCents = Math.round(pricing.total * 100);

    if (amountCents < 50) {
      return res.status(400).json({ error: 'Order total too small for card payment.', code: 'AMOUNT_TOO_SMALL' });
    }

    const orderNumber = generateOrderNumber();
    const estimatedDelivery = buildEstimatedDelivery();

    let order = new Order({
      orderNumber,
      email: customer.email,
      name: customer.name,
      shippingAddress: customer.shippingAddress,
      items: orderItems,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      total: pricing.total,
      currency: pricing.currency,
      estimatedDelivery,
      paymentInfo: { method: 'card', currency: pricing.currency },
      paymentStatus: 'pending',
      userId: req.user._id,
    });
    order.ensureInitialStatus();
    await order.save();

    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: pricing.currency,
        automatic_payment_methods: { enabled: true },
        receipt_email: customer.email,
        metadata: {
          orderId: String(order._id),
          orderNumber,
          userId: String(req.user._id),
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error('Stripe did not return a client secret.');
      }

      order.stripePaymentIntentId = paymentIntent.id;
      order.paymentStatus = 'processing';
      order.paymentInfo = {
        ...order.paymentInfo,
        stripePaymentIntentId: paymentIntent.id,
      };
      await order.save();
    } catch (paymentError) {
      if (paymentIntent?.id) {
        try {
          await stripe.paymentIntents.cancel(paymentIntent.id);
        } catch (cancelError) {
          console.error('Failed to cancel payment intent after checkout error:', cancelError);
        }
      }

      try {
        await Order.deleteOne({ _id: order._id });
      } catch (cleanupError) {
        console.error('Failed to remove incomplete order after checkout error:', cleanupError);
      }

      throw paymentError;
    }

    res.status(201).json(
      serializeOrderResponse(order, {
        clientSecret: paymentIntent.client_secret,
      })
    );
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to start payment', code: 'PAYMENT_INTENT_FAILED' });
  }
});

/**
 * Raw body handler mounted from index.js for Stripe signature verification.
 */
async function stripeWebhookHandler(req, res) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    return res.status(503).send('Stripe webhook not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], whSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: pi.id });
      if (order) {
        order.ensureInitialStatus();
        order.paymentStatus = 'paid';
        if (order.statusIndex === 0) {
          order.appendStatus('PAYMENT_VERIFIED');
        }
        order.paymentInfo = {
          ...order.paymentInfo,
          method: order.paymentInfo?.method || 'card',
          currency: order.currency || 'usd',
          stripePaymentIntentId: pi.id,
          paidAt: new Date(),
        };
        await order.save();
      }
    } else if (event.type === 'payment_intent.processing') {
      const pi = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: pi.id });
      if (order) {
        order.paymentStatus = 'processing';
        order.paymentInfo = {
          ...order.paymentInfo,
          stripePaymentIntentId: pi.id,
        };
        await order.save();
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: pi.id });
      if (order) {
        order.paymentStatus = 'failed';
        order.paymentInfo = {
          ...order.paymentInfo,
          stripePaymentIntentId: pi.id,
          lastError: pi.last_payment_error?.message || 'Payment failed',
        };
        await order.save();
      }
    } else if (event.type === 'payment_intent.canceled') {
      const pi = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: pi.id });
      if (order) {
        order.paymentStatus = 'failed';
        order.paymentInfo = {
          ...order.paymentInfo,
          stripePaymentIntentId: pi.id,
          lastError: 'Payment was canceled',
        };
        await order.save();
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Crypto demo checkout (no on-chain verification).
 */
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { items, name, email, shippingAddress, paymentMethod, cryptoCurrency, cryptoAmount, walletAddress } =
      req.body;

    const customer = normalizeCustomerFields({ name, email, shippingAddress });
    const normalizedItems = normalizeItems(items);

    if (paymentMethod === 'usd' || paymentMethod === 'card') {
      return res.status(400).json({
        error: 'Use POST /api/checkout/create-payment-intent for card payments.',
        code: 'USE_PAYMENT_INTENT',
      });
    }

    if (paymentMethod === 'crypto') {
      if (!cryptoCurrency || !cryptoAmount || !walletAddress) {
        return res.status(400).json({ error: 'Missing required crypto fields' });
      }

      if (!VALID_CRYPTO_CURRENCIES.has(String(cryptoCurrency).toUpperCase())) {
        return res.status(400).json({ error: 'Invalid cryptocurrency' });
      }

      const amount = Number(cryptoAmount);
      if (Number.isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid crypto amount' });
      }

      const trimmedWalletAddress = String(walletAddress).trim();
      if (trimmedWalletAddress.length < 26) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const productMap = await loadValidatedProducts(normalizedItems);
    const orderItems = buildOrderItems(normalizedItems, productMap);
    const pricing = calculatePricing(orderItems);

    const orderNumber = generateOrderNumber();
    const estimatedDelivery = buildEstimatedDelivery();

    const paymentInfo = {
      method: 'crypto',
      currency: pricing.currency,
      cryptoCurrency: String(cryptoCurrency).toUpperCase(),
      cryptoAmount: Number(cryptoAmount),
      walletAddress: String(walletAddress).trim(),
      verificationStatus: 'pending',
    };

    const order = new Order({
      orderNumber,
      email: customer.email,
      name: customer.name,
      shippingAddress: customer.shippingAddress,
      items: orderItems,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      total: pricing.total,
      currency: pricing.currency,
      estimatedDelivery,
      paymentInfo,
      paymentStatus: 'processing',
      userId: req.user._id,
    });

    order.ensureInitialStatus();
    await order.save();

    res.status(201).json(
      serializeOrderResponse(order, {
        message: 'Order received. Crypto payment must be verified before fulfillment begins.',
      })
    );
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
module.exports.stripeWebhookHandler = stripeWebhookHandler;
