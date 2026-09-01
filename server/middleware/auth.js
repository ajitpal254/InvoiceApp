import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!global._ephemeralSecret) {
    global._ephemeralSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[Security Notice] Using auto-generated ephemeral JWT_SECRET. Set JWT_SECRET in .env for production.');
  }
  return global._ephemeralSecret;
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
}

export { getJwtSecret };
