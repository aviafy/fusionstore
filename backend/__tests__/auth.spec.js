const request = require('supertest');

const app = () => global.__APP__;

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
}

describe('Auth flow', () => {
  it('registers a user, sets the auth cookie, and restores the session via /me', async () => {
    const agent = request.agent(app());
    const email = uniqueEmail('register');

    const register = await agent.post('/api/auth/register').send({
      email,
      password: 'registerpass123',
      name: 'New User',
    });

    expect(register.status).toBe(201);
    expect(register.body.user.email).toBe(email);
    expect(register.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')]),
    );

    const me = await agent.get('/api/auth/me');

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
    expect(me.body.user.name).toBe('New User');
  });

  it('clears the session on logout', async () => {
    const agent = request.agent(app());
    const email = uniqueEmail('logout');

    await agent.post('/api/auth/register').send({
      email,
      password: 'logoutpass123',
      name: 'Logout User',
    });

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=;')]),
    );

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });
});
