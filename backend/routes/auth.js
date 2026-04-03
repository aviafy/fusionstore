const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { requireAuth, getJwtSecret } = require('../middleware/authMiddleware');

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const registerValidators = [
  body('email').isEmail().normalizeEmail().isLength({ max: 254 }),
  body('password').isLength({ min: 8, max: 128 }),
  body('name').optional().trim().isLength({ max: 120 }),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1, max: 128 }),
];

function signToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

router.post('/register', registerValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION' });
    }
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered', code: 'EMAIL_TAKEN' });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      email,
      passwordHash,
      name: name || '',
      role: 'user',
    });
    const token = signToken(user._id);
    setAuthCookie(res, token);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error('register error:', e);
    res.status(500).json({ message: 'Registration failed', code: 'REGISTER_FAILED' });
  }
});

router.post('/login', loginValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }
    const token = signToken(user._id);
    setAuthCookie(res, token);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ message: 'Login failed', code: 'LOGIN_FAILED' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = router;
