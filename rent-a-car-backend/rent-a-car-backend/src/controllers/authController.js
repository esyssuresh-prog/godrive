import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    }
    // Public registration must never allow someone to create an admin account.
    const safeRole = role === 'owner' ? 'owner' : 'customer';
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, phone, password: hashedPassword, role: safeRole });
    return res.status(201).json({ message: 'Registration successful', token: makeToken(user._id), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    return res.json({ message: 'Login successful', token: makeToken(user._id), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}
