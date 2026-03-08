import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.CSRF_SECRET || process.env.SESSION_SECRET!;

function generateToken(_req: Request, _res: Response): string {
  const random = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', SECRET).update(random).digest('hex');
  return `${hmac}.${random}`;
}

function verifyToken(token: string): boolean {
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const hmac = token.substring(0, dot);
  const random = token.substring(dot + 1);
  if (!hmac || !random) return false;
  const expected = createHmac('sha256', SECRET).update(random).digest('hex');
  if (hmac.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'));
}

function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.headers['x-csrf-token'];
  if (typeof token !== 'string' || !verifyToken(token)) {
    return res.status(403).json({ message: 'invalid csrf token' });
  }
  next();
}

export { csrfProtection as doubleCsrfProtection, generateToken };
