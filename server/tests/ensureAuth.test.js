import express from 'express';
import request from 'supertest';
import ensureAuth from '../middleware/ensureAuth.js';

function createApp(isAuthenticated) {
  const app = express();
  app.use((req, res, next) => {
    req.isAuthenticated = () => isAuthenticated;
    next();
  });
  app.get('/protected', ensureAuth, (req, res) => res.json({ ok: true }));
  return app;
}

describe('ensureAuth middleware', () => {
  it('allows authenticated requests', async () => {
    const app = createApp(true);
    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects unauthenticated requests with 401', async () => {
    const app = createApp(false);
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authenticated');
  });
});
