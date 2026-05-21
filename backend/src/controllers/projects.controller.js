const db = require('../config/db');

// CREATE project
const createProject = async (req, res) => {
  try {
    const { name, description, team_id, start_date, end_date } = req.body;
    if (!name || !team_id) {
      return res.status(400).json({ success: false, message: 'Name and team are required.' });
    }

    const [result] = await db.query(
      `INSERT INTO projects (name, description, team_id, created_by, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, team_id, req.user.id, start_date || null, end_date || null]
    );

    // Log activity (wrapped so it never breaks project creation)
    try {
      await db.query(
        'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
        [req.user.id, result.insertId, 'project_created', `Project "${name}" was created`]
      );
    } catch (logErr) {
      console.log('Activity log warning:', logErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: { id: result.insertId, name, description, team_id }
    });
  } catch (error) {
    console.error('CreateProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET all projects
const getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, u.name AS created_by_name, t.name AS team_name,
      COUNT(DISTINCT tk.id) AS task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN tasks tk ON p.id = tk.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('GetAllProjects error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET single project
const getProjectById = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, u.name AS created_by_name, t.name AS team_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({ success: true, project: projects[0] });
  } catch (error) {
    console.error('GetProjectById error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// UPDATE project
const updateProject = async (req, res) => {
  try {
    const { name, description, status, start_date, end_date } = req.body;
    await db.query(
      `UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description),
       status = COALESCE(?, status), start_date = COALESCE(?, start_date),
       end_date = COALESCE(?, end_date) WHERE id = ?`,
      [name, description, status, start_date, end_date, req.params.id]
    );
    return res.status(200).json({ success: true, message: 'Project updated.' });
  } catch (error) {
    console.error('UpdateProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE project
const deleteProject = async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    console.error('DeleteProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET project activity feed
const getProjectActivity = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT al.*, u.name AS user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.project_id = ?
      ORDER BY al.created_at DESC
      LIMIT 50
    `, [req.params.id]);
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('GetProjectActivity error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ARCHIVE project
const archiveProject = async (req, res) => {
  try {
    await db.query(
      'UPDATE projects SET status = "completed" WHERE id = ?',
      [req.params.id]
    );
    try {
      await db.query(
        'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
        [req.user.id, req.params.id, 'project_archived', 'Project was archived']
      );
    } catch (logErr) { console.log('Log warning:', logErr.message) }

    return res.status(200).json({ success: true, message: 'Project archived.' });
  } catch (error) {
    console.error('ArchiveProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getProjectActivity, archiveProject };