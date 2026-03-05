const { doubleCsrf } = require('csrf-csrf');

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.session?.id || '',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

module.exports = { doubleCsrfProtection, generateToken: generateCsrfToken };
