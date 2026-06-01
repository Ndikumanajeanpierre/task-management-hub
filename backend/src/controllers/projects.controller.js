const db = require('../config/db');

// ─── helper: notify all admins and managers ───────────────────────────────
const notifyAdminsAndManagers = async (message, reference_id, excludeUserId = null) => {
  const [admins] = await db.query(
    `SELECT id FROM users WHERE role IN ('admin', 'manager') ${excludeUserId ? 'AND id != ?' : ''}`,
    excludeUserId ? [excludeUserId] : []
  );
  for (const admin of admins) {
    await db.query(
      'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
      [admin.id, 'system', message, reference_id]
    );
  }
};

// ─── helper: notify all members of a project ─────────────────────────────
const notifyProjectMembers = async (project_id, message, reference_id, excludeUserId = null) => {
  const [members] = await db.query(
    `SELECT DISTINCT u.id FROM users u
     INNER JOIN team_members tm ON tm.user_id = u.id
     INNER JOIN projects p ON p.team_id = tm.team_id
     WHERE p.id = ? ${excludeUserId ? 'AND u.id != ?' : ''}`,
    excludeUserId ? [project_id, excludeUserId] : [project_id]
  );
  for (const member of members) {
    await db.query(
      'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
      [member.id, 'system', message, reference_id]
    );
  }
};

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

    try {
      await db.query(
        'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
        [req.user.id, result.insertId, 'project_created', `Project "${name}" was created`]
      );
    } catch (logErr) { console.log('Activity log warning:', logErr.message); }

    await notifyProjectMembers(
      result.insertId,
      `New project "${name}" has been created by ${req.user.name}`,
      result.insertId,
      req.user.id
    );

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

    const [existing] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = existing[0];

    await db.query(
      `UPDATE projects SET
        name        = COALESCE(?, name),
        description = COALESCE(?, description),
        status      = COALESCE(?, status),
        start_date  = COALESCE(?, start_date),
        end_date    = COALESCE(?, end_date)
       WHERE id = ?`,
      [name, description, status, start_date, end_date, req.params.id]
    );

    if (status && status !== project.status) {
      await notifyProjectMembers(
        req.params.id,
        `Project "${project.name}" status changed to ${status.replace('_', ' ')} by ${req.user.name}`,
        req.params.id,
        req.user.id
      );
      await notifyAdminsAndManagers(
        `Project "${project.name}" status changed to ${status.replace('_', ' ')} by ${req.user.name}`,
        req.params.id,
        req.user.id
      );
    }

    return res.status(200).json({ success: true, message: 'Project updated.' });
  } catch (error) {
    console.error('UpdateProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE project
const deleteProject = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = existing[0];

    await notifyProjectMembers(
      req.params.id,
      `Project "${project.name}" has been deleted by ${req.user.name}`,
      req.params.id,
      req.user.id
    );

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
    const [existing] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = existing[0];

    await db.query(
      'UPDATE projects SET status = "completed" WHERE id = ?',
      [req.params.id]
    );

    try {
      await db.query(
        'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
        [req.user.id, req.params.id, 'project_archived', 'Project was archived']
      );
    } catch (logErr) { console.log('Log warning:', logErr.message); }

    await notifyProjectMembers(
      req.params.id,
      `Project "${project.name}" has been archived by ${req.user.name}`,
      req.params.id,
      req.user.id
    );

    return res.status(200).json({ success: true, message: 'Project archived.' });
  } catch (error) {
    console.error('ArchiveProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET all activity logs — admin only
const getAllActivity = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 50;
    const offset = parseInt(req.query.offset) || 0;
    const action = req.query.action           || '';

    let query = `
      SELECT al.*, u.name AS user_name, u.role AS user_role,
             p.name AS project_name, t.title AS task_title
      FROM activity_logs al
      LEFT JOIN users    u ON al.user_id    = u.id
      LEFT JOIN projects p ON al.project_id = p.id
      LEFT JOIN tasks    t ON al.task_id    = t.id
    `;
    const params = [];
    if (action) { query += ' WHERE al.action = ?'; params.push(action); }
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [logs] = await db.query(query, params);
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM activity_logs ${action ? 'WHERE action = ?' : ''}`,
      action ? [action] : []
    );

    return res.status(200).json({ success: true, logs, total });
  } catch (error) {
    console.error('GetAllActivity error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET real project stats for reports
const getProjectStats = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.status,
        p.end_date,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.due_date IS NOT NULL
                  AND DATE(t.due_date) < CURDATE()
                  AND t.status != 'done' THEN 1 ELSE 0 END) AS overdue_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `)

    const stats = projects.map(p => ({
      ...p,
      total_tasks:     parseInt(p.total_tasks)     || 0,
      completed_tasks: parseInt(p.completed_tasks) || 0,
      overdue_tasks:   parseInt(p.overdue_tasks)   || 0,
      completion_rate: parseInt(p.total_tasks) > 0
        ? Math.round((parseInt(p.completed_tasks) / parseInt(p.total_tasks)) * 100)
        : 0,
    }))

    return res.status(200).json({ success: true, stats })
  } catch (error) {
    console.error('GetProjectStats error:', error.message)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectActivity,
  archiveProject,
  getAllActivity,
  getProjectStats,
};