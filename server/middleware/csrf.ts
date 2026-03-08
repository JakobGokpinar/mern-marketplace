import { doubleCsrf } from 'csrf-csrf';
import logger from '../config/logger';

const isProduction = process.env.NODE_ENV === 'production';
logger.info(`CSRF config: NODE_ENV=${process.env.NODE_ENV}, sameSite=${isProduction ? 'none' : 'lax'}, secure=${isProduction}`);

const { doubleCsrfProtection: rawCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.SESSION_SECRET!,
  getSessionIdentifier: () => '',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  },
  getCsrfTokenFromRequest: (req: any) => req.headers['x-csrf-token'],
});

const doubleCsrfProtection = (req: any, res: any, next: any) => {
  const csrfCookie = req.cookies?.['__csrf'] || '(missing)';
  const csrfHeader = req.headers['x-csrf-token'] || '(missing)';
  logger.info(`CSRF check: cookie=${csrfCookie.substring(0, 12)}… header=${csrfHeader.substring(0, 12)}… match=${csrfCookie === csrfHeader}`);
  rawCsrfProtection(req, res, next);
};

export { doubleCsrfProtection, generateCsrfToken as generateToken };
