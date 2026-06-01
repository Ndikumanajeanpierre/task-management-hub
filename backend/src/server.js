const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  }
});

// ── Socket.io JWT auth middleware ─────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) {
    console.log('⚠️  Socket connection rejected — no token')
    return next(new Error('Authentication required'))
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded   // attach user to socket
    next()
  } catch (err) {
    console.log('⚠️  Socket connection rejected — invalid token')
    next(new Error('Invalid token'))
  }
})

// ── Socket.io events ──────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ ${socket.user?.name} connected (${socket.id})`)

  // Join a project room
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`)
    console.log(`📌 ${socket.user?.name} joined project_${projectId}`)
  })

  // Leave a project room
  socket.on('leave_project', (projectId) => {
    socket.leave(`project_${projectId}`)
    console.log(`👋 ${socket.user?.name} left project_${projectId}`)
  })

  // Task moved — broadcast to everyone else in the project room
  socket.on('task_moved', (data) => {
    socket.to(`project_${data.project_id}`).emit('task_updated', {
      ...data,
      moved_by: socket.user?.name,
    })
    console.log(`🔄 ${socket.user?.name} moved task in project_${data.project_id}`)
  })

  socket.on('disconnect', (reason) => {
    console.log(`❌ ${socket.user?.name} disconnected (${reason})`)
  })
})

// make io accessible in controllers
app.set('io', io)

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Task Management Hub API is running',
    version: '1.0.0',
    status: 'OK'
  })
})

// ── Routes ────────────────────────────────────────────────
const authRoutes    = require('./routes/auth.routes')
const usersRoutes   = require('./routes/users.routes')
const teamsRoutes   = require('./routes/teams.routes')
const projectRoutes = require('./routes/projects.routes')
const tasksRoutes   = require('./routes/tasks.routes')

app.use('/api/auth',     authRoutes)
app.use('/api/users',    usersRoutes)
app.use('/api/teams',    teamsRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks',    tasksRoutes)

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  })
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' })
  if (err.message?.includes('Only JPEG'))
    return res.status(400).json({ success: false, message: err.message })
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' })
})

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.io ready for real-time connections`)
  console.log(`🗄️  Database: ${process.env.DB_NAME}`)
})