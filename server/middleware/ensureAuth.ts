import type { Request, Response, NextFunction } from 'express';

const ensureAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

export default ensureAuth;
