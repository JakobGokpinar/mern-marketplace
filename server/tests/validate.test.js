import express from 'express';
import request from 'supertest';
import validate from '../middleware/validate.js';
import { z } from 'zod';

function createApp(schema, source = 'body') {
  const app = express();
  app.use(express.json());
  if (source === 'body') {
    app.post('/test', validate(schema), (req, res) => res.json({ data: req.body }));
  } else {
    app.get('/test', validate(schema, 'query'), (req, res) => res.json({ data: req.query }));
  }
  return app;
}

describe('validate middleware', () => {
  const bodySchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
  });

  it('passes valid body through', async () => {
    const app = createApp(bodySchema);
    const res = await request(app).post('/test').send({ name: 'Jakob', age: 25 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Jakob');
  });

  it('rejects missing required field', async () => {
    const app = createApp(bodySchema);
    const res = await request(app).post('/test').send({ age: 25 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].field).toBe('name');
  });

  it('rejects wrong type', async () => {
    const app = createApp(bodySchema);
    const res = await request(app).post('/test').send({ name: 'Jakob', age: 'old' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('age');
  });

  it('validates query params', async () => {
    const querySchema = z.object({
      id: z.string().regex(/^[a-f\d]{24}$/i),
    });
    const app = createApp(querySchema, 'query');

    const res = await request(app).get('/test?id=abc');
    expect(res.status).toBe(400);

    const res2 = await request(app).get('/test?id=507f1f77bcf86cd799439011');
    expect(res2.status).toBe(200);
  });

  it('returns multiple errors', async () => {
    const app = createApp(bodySchema);
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });
});
