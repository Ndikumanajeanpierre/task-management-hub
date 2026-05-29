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

    // Get team name for notification message
    const [teams] = await db.query('SELECT name FROM teams WHERE id = ?', [req.params.id]);
    const teamName = teams[0]?.name || 'a team';

    // Notify the added user
    await db.query(
      'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
      [user_id, 'team', `You have been added to team "${teamName}" by ${req.user.name}`, req.params.id]
    );

    // Notify admins/managers
    const [admins] = await db.query(
      `SELECT id FROM users WHERE role IN ('admin', 'manager') AND id != ?`,
      [req.user.id]
    );
    const [addedUser] = await db.query('SELECT name FROM users WHERE id = ?', [user_id]);
    for (const admin of admins) {
      await db.query(
        'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
        [admin.id, 'team',
         `${addedUser[0]?.name} was added to team "${teamName}" by ${req.user.name}`,
         req.params.id]
      );
    }

    return res.status(201).json({ success: true, message: 'Member added successfully.' });
  } catch (error) {
    console.error('AddMember error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// REMOVE member from team
const removeMember = async (req, res) => {
  try {
    // Get team and user info before deleting
    const [teams] = await db.query('SELECT name FROM teams WHERE id = ?', [req.params.id]);
    const [removedUser] = await db.query('SELECT name FROM users WHERE id = ?', [req.params.userId]);
    const teamName = teams[0]?.name || 'a team';

    await db.query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );

    // Notify the removed user
    await db.query(
      'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
      [req.params.userId, 'team',
       `You have been removed from team "${teamName}" by ${req.user.name}`,
       req.params.id]
    );

    // Notify admins/managers
    const [admins] = await db.query(
      `SELECT id FROM users WHERE role IN ('admin', 'manager') AND id != ?`,
      [req.user.id]
    );
    for (const admin of admins) {
      await db.query(
        'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
        [admin.id, 'team',
         `${removedUser[0]?.name} was removed from team "${teamName}" by ${req.user.name}`,
         req.params.id]
      );
    }

    return res.status(200).json({ success: true, message: 'Member removed.' });
  } catch (error) {
    console.error('RemoveMember error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createTeam, getAllTeams, getTeamById, addMember, removeMember };