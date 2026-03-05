const { ZodError } = require('zod');

/**
 * Express middleware factory — validates req.body, req.query, or req.params
 * against a Zod schema.
 *
 * Usage: router.post('/foo', validate(mySchema), controller.foo)
 *        router.get('/bar', validate(mySchema, 'query'), controller.bar)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
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

module.exports = validate;
