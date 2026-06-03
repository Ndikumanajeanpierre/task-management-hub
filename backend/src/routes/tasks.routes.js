const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getNotifications,
  uploadAttachment,
  getAttachments,
  markNotificationsRead,
  markSingleNotificationRead,
  getMyTasks
} = require('../controllers/tasks.controller')
const { auth } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|png|jpg|jpeg|zip/
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.test(ext)) cb(null, true)
    else cb(new Error('File type not allowed'))
  }
})

router.post('/',                              auth,                        createTask)
router.get('/my',                             auth,                        getMyTasks)
router.get('/project/:projectId',             auth,                        getTasksByProject)
router.get('/notifications',                  auth,                        getNotifications)
router.patch('/notifications/read',           auth,                        markNotificationsRead)
router.patch('/notifications/:id/read',       auth,                        markSingleNotificationRead)
router.get('/:id',                            auth,                        getTaskById)
router.patch('/:id',                          auth,                        updateTask)
router.delete('/:id',                         auth,                        deleteTask)
router.post('/:id/comments',                  auth,                        addComment)
router.post('/:id/attachments',               auth, upload.single('file'), uploadAttachment)
router.get('/:id/attachments',                auth,                        getAttachments)

module.exports = router