const db = require('../config/db');

// GET all users (Admin only)
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

// GET single user by ID
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

// UPDATE user role (Admin only)
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

// DELETE user (Admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    console.error('DeleteUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };