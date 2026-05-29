const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

// ─── EMAIL TRANSPORTER ───────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── REGISTER ───────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = role === 'manager' || role === 'admin' ? 'member' : (role || 'member');

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, userRole]
    );

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
        id:     result.insertId,
        name,
        email,
        role:   userRole,
        avatar: null,
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const [users] = await db.query(
      'SELECT id, name, email, role, avatar, password_hash FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

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
        id:     user.id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar || null,
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
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
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

// ─── FORGOT PASSWORD ─────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const [users] = await db.query(
      'SELECT id, name FROM users WHERE email = ?', [email]
    );

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.'
      });
    }

    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Task Management Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              <div style="width: 36px; height: 36px; background: #2563eb; border-radius: 8px; display: inline-block; text-align: center; line-height: 36px; color: white; font-weight: bold;">✓</div>
              <span style="font-size: 18px; font-weight: bold; color: #1f2937;">Task Management Hub</span>
            </div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
              Hi ${user.name}, we received a request to reset your password. Click the button below to create a new one.
            </p>
            <a href="${resetUrl}"
              style="display: block; background: #2563eb; color: white; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; text-decoration: none; margin-bottom: 24px;">
              Reset Password →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
              This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #d1d5db; font-size: 11px; word-break: break-all;">
              Or copy this link: ${resetUrl}
            </p>
          </div>
          <p style="text-align: center; color: #d1d5db; font-size: 11px; margin-top: 16px;">
            © 2026 Task Management Hub — Jean Pierre Ndikumana
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.'
    });

  } catch (error) {
    console.error('ForgotPassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── RESET PASSWORD ──────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const [users] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired.'
      });
    }

    const user = users[0];

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password_hash, user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });

  } catch (error) {
    console.error('ResetPassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };