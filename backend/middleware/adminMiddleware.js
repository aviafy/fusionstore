function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required', code: 'FORBIDDEN' });
  }
  next();
}

module.exports = { requireAdmin };
