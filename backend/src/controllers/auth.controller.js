const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ─── REGISTER ───────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    // Check if email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Only allow admin to set manager role
    const userRole = role === 'manager' || role === 'admin' ? 'member' : (role || 'member');

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, userRole]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, name, email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── LOGIN ───────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── GET CURRENT USER ────────────────────────
const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

module.exports = { register, login, getMe };