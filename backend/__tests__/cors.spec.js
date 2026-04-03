const request = require('supertest');

describe('CORS configuration', () => {
  const originalClientOrigin = process.env.CLIENT_ORIGIN;

  afterEach(() => {
    process.env.CLIENT_ORIGIN = originalClientOrigin;
    jest.resetModules();
  });

  it('allows wildcard Vercel preview origins when configured', async () => {
    process.env.CLIENT_ORIGIN = 'https://*.vercel.app';

    let app;
    jest.isolateModules(() => {
      app = require('../index');
    });

    const res = await request(app)
      .options('/api/products')
      .set('Origin', 'https://fusionstore-mocha.vercel.app')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://fusionstore-mocha.vercel.app');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
