const request = require('supertest');
const Product = require('../models/product');
const User = require('../models/user');
const ProductRating = require('../models/productRating');
const bcrypt = require('bcrypt');

const app = () => global.__APP__;

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('200 → returns paginated products', async () => {
      const res = await request(app()).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products[0]).toHaveProperty('id');
    });
  });

  describe('GET /api/products/:id', () => {
    it('200 → returns product when found', async () => {
      const res = await request(app()).get('/api/products/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
      expect(res.body.name).toBeDefined();
    });

    it('404 → product not found', async () => {
      const res = await request(app()).get('/api/products/doesnotexist999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('GET /api/products/category/:category', () => {
    it('200 → returns products in category', async () => {
      const res = await request(app()).get('/api/products/category/smartphones');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/products/:id/rating', () => {
    it('401 without auth', async () => {
      const res = await request(app()).put('/api/products/1/rating').send({ rating: 5 });
      expect(res.status).toBe(401);
    });

    it('200 → updates rating when authenticated', async () => {
      const pid = `rate-test-${Date.now()}`;
      await Product.create({
        _id: pid,
        name: 'Rating Test',
        description: 'd',
        price: 9.99,
        category: 'electronics',
        image: 'https://example.com/p.jpg',
        stock: 5,
        rating: 0,
        numReviews: 0,
      });

      const passwordHash = await bcrypt.hash('testpass123', 4);
      const user = await User.create({
        email: `rate-${Date.now()}@test.com`,
        passwordHash,
        name: 'Tester',
      });
      const login = await request(app())
        .post('/api/auth/login')
        .send({ email: user.email, password: 'testpass123' });
      const token = login.body.token;

      const res = await request(app())
        .put(`/api/products/${pid}/rating`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(5);
      expect(res.body.numReviews).toBe(1);

      await ProductRating.deleteMany({ productId: pid });
      await Product.deleteOne({ _id: pid });
      await User.deleteOne({ _id: user._id });
    });
  });
});
