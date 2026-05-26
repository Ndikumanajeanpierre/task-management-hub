const db = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('GetAllUsers error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    console.error('GetUserById error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: rows[0]
    });
  } catch (error) {
    console.error('UpdateUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'manager', 'member'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot modify your own role.'
      });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    return res.status(200).json({ success: true, message: 'User role updated.' });
  } catch (error) {
    console.error('UpdateUserRole error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    console.error('DeleteUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' })
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
    }

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.params.id])

    return res.status(200).json({ success: true, message: 'Password changed successfully.' })
  } catch (error) {
    console.error('ChangePassword error:', error.message)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// UPDATE user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' })
    }

    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.params.id]
    )

    return res.status(200).json({ success: true, message: 'Profile updated successfully.' })
  } catch (error) {
    console.error('UpdateProfile error:', error.message)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}
module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser, changePassword, updateProfile }