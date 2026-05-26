const express = require('express')
const router = express.Router()
const {
  getAllUsers, getUserById, updateUserRole,
  deleteUser, changePassword, updateProfile
} = require('../controllers/users.controller')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', auth, requireRole('admin'), getAllUsers)
router.get('/:id', auth, getUserById)
router.put('/:id', auth, updateProfile)
router.patch('/:id/role', auth, requireRole('admin'), updateUserRole)
router.patch('/:id/password', auth, changePassword)
router.delete('/:id', auth, requireRole('admin'), deleteUser)

module.exports = router