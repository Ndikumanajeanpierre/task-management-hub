const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/users.controller');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin'), getAllUsers);
router.get('/:id', auth, getUserById);
router.patch('/:id/role', auth, requireRole('admin'), updateUserRole);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;