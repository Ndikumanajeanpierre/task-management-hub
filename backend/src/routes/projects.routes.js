const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getProjectActivity } = require('../controllers/projects.controller');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('admin', 'manager'), createProject);
router.get('/', auth, getAllProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, requireRole('admin', 'manager'), updateProject);
router.delete('/:id', auth, requireRole('admin', 'manager'), deleteProject);
router.get('/:id/activity', auth, getProjectActivity);

module.exports = router;