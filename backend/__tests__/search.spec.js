const request = require('supertest');

const app = () => global.__APP__;

describe('Search API', () => {
  it('200 → returns products for empty query (limited)', async () => {
    const res = await request(app()).get('/api/search');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 → finds products by query', async () => {
    const res = await request(app()).get('/api/search').query({ q: 'iphone' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
