export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
}
