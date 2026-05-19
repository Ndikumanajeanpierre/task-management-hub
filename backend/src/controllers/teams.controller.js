const db = require('../config/db');

// CREATE team
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Team name is required.' });
    }

    const [result] = await db.query(
      'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || null, req.user.id]
    );

    // Add creator as owner in team_members
    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.user.id, 'owner']
    );

    return res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      team: { id: result.insertId, name, description }
    });
  } catch (error) {
    console.error('CreateTeam error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET all teams
const getAllTeams = async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.*, u.name AS created_by_name,
      COUNT(tm.id) AS member_count
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error('GetAllTeams error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET single team with members
const getTeamById = async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (teams.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const [members] = await db.query(`
      SELECT u.id, u.name, u.email, u.role, tm.role AS team_role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
    `, [req.params.id]);

    return res.status(200).json({
      success: true,
      team: { ...teams[0], members }
    });
  } catch (error) {
    console.error('GetTeamById error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ADD member to team
const addMember = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    // Check if already a member
    const [existing] = await db.query(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [req.params.id, user_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User is already a member.' });
    }

    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [req.params.id, user_id, role || 'member']
    );

    return res.status(201).json({ success: true, message: 'Member added successfully.' });
  } catch (error) {
    console.error('AddMember error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// REMOVE member from team
const removeMember = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    return res.status(200).json({ success: true, message: 'Member removed.' });
  } catch (error) {
    console.error('RemoveMember error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createTeam, getAllTeams, getTeamById, addMember, removeMember };