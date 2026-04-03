const jwt = require('jsonwebtoken');
const User = require('../models/user');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set and at least 16 characters in production');
  }
  return 'dev-only-jwt-secret-change-me';
}

function optionalAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const payload = jwt.verify(token, getJwtSecret());
    User.findById(payload.sub)
      .select('-passwordHash')
      .then(user => {
        req.user = user;
        next();
      })
      .catch(() => {
        req.user = null;
        next();
      });
  } catch {
    req.user = null;
    next();
  }
}

function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    const payload = jwt.verify(token, getJwtSecret());
    User.findById(payload.sub)
      .select('-passwordHash')
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Invalid session', code: 'AUTH_INVALID' });
        }
        req.user = user;
        next();
      })
      .catch(() => res.status(401).json({ message: 'Invalid session', code: 'AUTH_INVALID' }));
  } catch {
    return res.status(401).json({ message: 'Invalid session', code: 'AUTH_INVALID' });
  }
}

function readToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

module.exports = { optionalAuth, requireAuth, getJwtSecret };
