export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      const errors = err.errors || err.issues;
      if (errors && Array.isArray(errors)) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(e => ({
            field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
            message: e.message
          }))
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
}
