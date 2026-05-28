const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const {
  getAllUsers, getUserById, updateUserRole,
  deleteUser, changePassword, updateProfile, uploadAvatar
} = require('../controllers/users.controller')
const { auth, requireRole } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar_${req.params.id}_${Date.now()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only JPEG, PNG and WEBP images are allowed.'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

router.get('/',               auth, requireRole('admin'), getAllUsers)
router.get('/:id',            auth, getUserById)
router.put('/:id',            auth, updateProfile)
router.patch('/:id/role',     auth, requireRole('admin'), updateUserRole)
router.patch('/:id/password', auth, changePassword)
router.post('/:id/avatar',    auth, upload.single('avatar'), uploadAvatar)
router.delete('/:id',         auth, requireRole('admin'), deleteUser)

module.exports = router