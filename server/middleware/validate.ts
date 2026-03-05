import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      (req as any)[source] = schema.parse((req as any)[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };

export default validate;
