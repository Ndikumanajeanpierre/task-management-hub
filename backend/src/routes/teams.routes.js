const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, getTeamById, addMember, removeMember } = require('../controllers/teams.controller');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('admin', 'manager'), createTeam);
router.get('/', auth, getAllTeams);
router.get('/:id', auth, getTeamById);
router.post('/:id/members', auth, requireRole('admin', 'manager'), addMember);
router.delete('/:id/members/:userId', auth, requireRole('admin', 'manager'), removeMember);

module.exports = router;