const request = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

const mockStripeClient = {
  paymentIntents: {
    create: jest.fn(),
    cancel: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('stripe', () => jest.fn(() => mockStripeClient));

const app = () => global.__APP__;

async function loginNewUser() {
  const email = `co-${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('checkoutpass123', 4);
  await User.create({ email, passwordHash, name: 'Buyer' });
  const login = await request(app()).post('/api/auth/login').send({ email, password: 'checkoutpass123' });
  return { token: login.body.token, email };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_mocked';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mocked';
});

describe('POST /api/checkout/create-order', () => {
  it('401 → without auth', async () => {
    const res = await request(app())
      .post('/api/checkout/create-order')
      .send({
        items: [{ productId: '1', quantity: 1 }],
        name: 'Test',
        email: 'test@example.com',
        shippingAddress: 'Addr',
        paymentMethod: 'crypto',
        cryptoCurrency: 'ETH',
        cryptoAmount: '0.01',
        walletAddress: '0x1234567890123456789012345678901234567890',
      });
    expect(res.status).toBe(401);
  });

  it('400 → missing required fields', async () => {
    const { token, email } = await loginNewUser();
    const res = await request(app())
      .post('/api/checkout/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [],
        email: 'test@example.com',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name and shipping address are required.');
    await User.deleteOne({ email });
  });

  it('400 → invalid email format', async () => {
    const { token, email } = await loginNewUser();
    const res = await request(app())
      .post('/api/checkout/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '1', quantity: 1 }],
        name: 'Test',
        email: 'invalid-email',
        shippingAddress: 'Addr',
        paymentMethod: 'crypto',
        cryptoCurrency: 'ETH',
        cryptoAmount: '0.01',
        walletAddress: '0x1234567890123456789012345678901234567890',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
    await User.deleteOne({ email });
  });

  it('400 → usd must use payment intent', async () => {
    const { token, email } = await loginNewUser();
    const res = await request(app())
      .post('/api/checkout/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '1', quantity: 1 }],
        name: 'Test',
        email: 'ok@example.com',
        shippingAddress: 'Addr',
        paymentMethod: 'usd',
      });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('USE_PAYMENT_INTENT');
    await User.deleteOne({ email });
  });

  it('201 → crypto orders stay in processing until payment is verified', async () => {
    const { token, email } = await loginNewUser();
    const create = await request(app())
      .post('/api/checkout/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '1', quantity: 1 }],
        name: 'Crypto Buyer',
        email: 'crypto@example.com',
        shippingAddress: 'Addr',
        paymentMethod: 'crypto',
        cryptoCurrency: 'ETH',
        cryptoAmount: '0.25',
        walletAddress: '0x1234567890123456789012345678901234567890',
      });

    expect(create.status).toBe(201);
    expect(create.body.paymentStatus).toBe('processing');
    expect(create.body.paymentMethod).toBe('crypto');

    const track = await request(app()).post('/api/orders/track').send({
      orderNumber: create.body.orderNumber,
      email: 'crypto@example.com',
    });

    expect(track.status).toBe(200);
    expect(track.body.paymentStatus).toBe('processing');
    expect(track.body.currentStatus.code).toBe('ORDER_PLACED');
    expect(track.body.statusHistory).toHaveLength(1);

    await User.deleteOne({ email });
  });
});

describe('POST /api/checkout/create-payment-intent', () => {
  it('201 → returns server-calculated totals and processing payment state', async () => {
    const { token, email } = await loginNewUser();
    await Product.create({
      _id: 'low-price-test-product',
      name: 'Budget Cable',
      description: 'Low price item for shipping checks.',
      price: 10,
      category: 'accessories',
      image: '/images/products/test.jpg',
      brand: 'Fusion',
      stock: 5,
      rating: 4.2,
      numReviews: 3,
      isFeatured: false,
    });

    mockStripeClient.paymentIntents.create.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_secret_123',
    });

    const res = await request(app())
      .post('/api/checkout/create-payment-intent')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 'low-price-test-product', quantity: 1 }],
        name: 'Card Buyer',
        email: 'card@example.com',
        shippingAddress: 'Addr',
      });

    expect(res.status).toBe(201);
    expect(res.body.paymentMethod).toBe('card');
    expect(res.body.paymentStatus).toBe('processing');
    expect(res.body.subtotal).toBe(10);
    expect(res.body.shippingCost).toBe(9.99);
    expect(res.body.total).toBe(19.99);
    expect(res.body.clientSecret).toBe('pi_test_secret_123');

    const order = await Order.findOne({ orderNumber: res.body.orderNumber });
    expect(order).toBeTruthy();
    expect(order.subtotal).toBe(10);
    expect(order.shippingCost).toBe(9.99);
    expect(order.total).toBe(19.99);
    expect(order.paymentStatus).toBe('processing');
    expect(order.stripePaymentIntentId).toBe('pi_test_123');

    await Product.deleteOne({ _id: 'low-price-test-product' });
    await User.deleteOne({ email });
  });
});

describe('POST /api/checkout/webhook', () => {
  it('200 → payment_intent.succeeded marks order paid and verifies payment status flow', async () => {
    const { token, email } = await loginNewUser();

    mockStripeClient.paymentIntents.create.mockResolvedValue({
      id: 'pi_test_webhook',
      client_secret: 'pi_test_secret_webhook',
    });

    const create = await request(app())
      .post('/api/checkout/create-payment-intent')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '1', quantity: 1 }],
        name: 'Webhook Buyer',
        email: 'webhook@example.com',
        shippingAddress: 'Addr',
      });

    expect(create.status).toBe(201);

    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_webhook',
        },
      },
    });

    const webhook = await request(app())
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(webhook.status).toBe(200);

    const order = await Order.findOne({ orderNumber: create.body.orderNumber });
    expect(order.paymentStatus).toBe('paid');
    expect(order.statusHistory.some((entry) => entry.code === 'PAYMENT_VERIFIED')).toBe(true);

    await User.deleteOne({ email });
  });
});
