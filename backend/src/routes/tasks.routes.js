const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, getTaskById, updateTask, deleteTask, addComment, getNotifications } = require('../controllers/tasks.controller');
const { auth } = require('../middleware/auth');

router.post('/', auth, createTask);
router.get('/project/:projectId', auth, getTasksByProject);
router.get('/notifications', auth, getNotifications);
router.get('/:id', auth, getTaskById);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.post('/:id/comments', auth, addComment);

module.exports = router;