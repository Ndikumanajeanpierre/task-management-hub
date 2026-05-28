const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED: uploads is at project root, two levels above backend/src/
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Task Management Hub API is running',
    version: '1.0.0',
    status: 'OK'
  });
});

const authRoutes    = require('./routes/auth.routes');
const usersRoutes   = require('./routes/users.routes');
const teamsRoutes   = require('./routes/teams.routes');
const projectRoutes = require('./routes/projects.routes');
const tasksRoutes   = require('./routes/tasks.routes');

app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/teams',    teamsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    tasksRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' });
  if (err.message?.includes('Only JPEG'))
    return res.status(400).json({ success: false, message: err.message });
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);
  socket.on('join_project',  (projectId) => { socket.join(`project_${projectId}`); });
  socket.on('leave_project', (projectId) => { socket.leave(`project_${projectId}`); });
  socket.on('task_moved', (data) => { socket.to(`project_${data.project_id}`).emit('task_updated', data); });
  socket.on('disconnect', () => { console.log(`❌ User disconnected: ${socket.id}`); });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
});