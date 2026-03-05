import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.SESSION_SECRET!,
  getSessionIdentifier: (req: any) => req.session?.id || '',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  getCsrfTokenFromRequest: (req: any) => req.headers['x-csrf-token'],
});

export { doubleCsrfProtection, generateCsrfToken as generateToken };
