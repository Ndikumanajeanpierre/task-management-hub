const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, updateUser,
  updateUserRole, deleteUser
} = require('../controllers/users.controller');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin'), getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.patch('/:id/role', auth, requireRole('admin'), updateUserRole);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;