const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import database (runs connection test on startup)
require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express.static('uploads'))

// ─── Health check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Task Management Hub API is running',
    version: '1.0.0',
    status: 'OK'
  });
});

// ─── Import Routes ────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const usersRoutes    = require('./routes/users.routes');
const teamsRoutes    = require('./routes/teams.routes');
const projectRoutes  = require('./routes/projects.routes');
const tasksRoutes    = require('./routes/tasks.routes');

// ─── Use Routes ───────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/teams',    teamsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    tasksRoutes);

// ─── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ─── Global Error Handler ─────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.'
  });
});

// ─── Socket.io ────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Join a project room for real-time updates
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User joined project room: ${projectId}`);
  });

  // Leave a project room
  socket.on('leave_project', (projectId) => {
    socket.leave(`project_${projectId}`);
    console.log(`User left project room: ${projectId}`);
  });

  // Task drag and drop from frontend
  socket.on('task_moved', (data) => {
    // Broadcast to everyone else in the project room
    socket.to(`project_${data.project_id}`).emit('task_updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Make io accessible in all route controllers
app.set('io', io);

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
});