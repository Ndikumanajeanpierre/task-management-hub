const db = require('../config/db');

// CREATE task
const createTask = async (req, res) => {
  try {
    const { title, description, project_id, assigned_to, priority, due_date, status, labels } = req.body;
    if (!title || !project_id) {
      return res.status(400).json({ success: false, message: 'Title and project are required.' });
    }

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, due_date, status, labels)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, project_id, assigned_to || null, req.user.id,
       priority || 'medium', due_date || null, status || 'todo', labels || null]
    );

    await db.query(
      'INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, project_id, result.insertId, 'task_created', `Task "${title}" was created`]
    );

    if (assigned_to) {
      await db.query(
        'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
        [assigned_to, 'task_assigned', `You have been assigned a new task: "${title}"`, result.insertId]
      );
    }

    const io = req.app.get('io');
    io.to(`project_${project_id}`).emit('task_created', {
      task_id: result.insertId, title, project_id
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: { id: result.insertId, title, project_id, status: status || 'todo' }
    });
  } catch (error) {
    console.error('CreateTask error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET all tasks for a project
const getTasksByProject = async (req, res) => {
  try {
    const { status, priority, assigned_to, due_date_from, due_date_to, search } = req.query;
    let query = `
      SELECT t.*, u.name AS assigned_to_name, c.name AS created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.project_id = ?
    `;
    const params = [req.params.projectId];

    if (status)        { query += ' AND t.status = ?';                             params.push(status); }
    if (priority)      { query += ' AND t.priority = ?';                           params.push(priority); }
    if (assigned_to)   { query += ' AND t.assigned_to = ?';                        params.push(assigned_to); }
    if (due_date_from) { query += ' AND t.due_date >= ?';                          params.push(due_date_from); }
    if (due_date_to)   { query += ' AND t.due_date <= ?';                          params.push(due_date_to); }
    if (search)        { query += ' AND (t.title LIKE ? OR t.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY t.position ASC, t.created_at DESC';

    const [tasks] = await db.query(query, params);
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('GetTasksByProject error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET single task
const getTaskById = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name, c.name AS created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const [comments] = await db.query(`
      SELECT cm.*, u.name AS user_name
      FROM comments cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.task_id = ?
      ORDER BY cm.created_at ASC
    `, [req.params.id]);

    return res.status(200).json({
      success: true,
      task: { ...tasks[0], comments }
    });
  } catch (error) {
    console.error('GetTaskById error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// UPDATE task
const updateTask = async (req, res) => {
  try {
    const { title, description, assigned_to, priority, due_date, status, position } = req.body;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await db.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        assigned_to = COALESCE(?, assigned_to),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status),
        position = COALESCE(?, position)
       WHERE id = ?`,
      [title, description, assigned_to, priority, due_date, status, position, req.params.id]
    );

    if (status && status !== existing[0].status) {
      await db.query(
        'INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, existing[0].project_id, req.params.id, 'task_moved',
         `Task "${existing[0].title}" moved to ${status}`]
      );

      if (existing[0].assigned_to) {
        await db.query(
          'INSERT INTO notifications (user_id, type, message, reference_id) VALUES (?, ?, ?, ?)',
          [existing[0].assigned_to, 'task_updated',
           `Task "${existing[0].title}" status changed to ${status}`, req.params.id]
        );
      }
    }

    const io = req.app.get('io');
    io.to(`project_${existing[0].project_id}`).emit('task_updated', {
      task_id: req.params.id, status, position
    });

    return res.status(200).json({ success: true, message: 'Task updated.' });
  } catch (error) {
    console.error('UpdateTask error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE task
const deleteTask = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    const io = req.app.get('io');
    io.to(`project_${existing[0].project_id}`).emit('task_deleted', {
      task_id: req.params.id, project_id: existing[0].project_id
    });

    return res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    console.error('DeleteTask error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ADD comment
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const [task] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (task.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );

    const io = req.app.get('io');
    io.to(`project_${task[0].project_id}`).emit('comment_added', {
      task_id: req.params.id,
      comment: { id: result.insertId, content, user_id: req.user.id, user_name: req.user.name }
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added.',
      comment: { id: result.insertId, content }
    });
  } catch (error) {
    console.error('AddComment error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET notifications — joins tasks to get project_id for navigation
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT n.*, t.project_id
       FROM notifications n
       LEFT JOIN tasks t ON n.reference_id = t.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('GetNotifications error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// UPLOAD attachment
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const [task] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (task.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO attachments (task_id, uploaded_by, file_name, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, req.file.originalname, req.file.path, req.file.size]
    );

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      attachment: {
        id: result.insertId,
        file_name: req.file.originalname,
        file_size: req.file.size,
      }
    });
  } catch (error) {
    console.error('UploadAttachment error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET attachments
const getAttachments = async (req, res) => {
  try {
    const [attachments] = await db.query(
      `SELECT a.*, u.name AS uploaded_by_name
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.task_id = ?
       ORDER BY a.uploaded_at DESC`,
      [req.params.id]
    );
    return res.status(200).json({ success: true, attachments });
  } catch (error) {
    console.error('GetAttachments error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// MARK notifications as read
const markNotificationsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    return res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('MarkNotificationsRead error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET tasks assigned to OR created by logged-in user
const getMyTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT
        t.*,
        p.name  AS project_name,
        u.name  AS assignee_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users   u ON t.assigned_to = u.id
       WHERE t.assigned_to = ?
          OR t.created_by  = ?
       ORDER BY t.due_date ASC, t.created_at DESC`,
      [req.user.id, req.user.id]
    );
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('GetMyTasks error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
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
  getMyTasks,
};