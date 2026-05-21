import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import KanbanColumn from '../components/KanbanColumn'
import TaskModal from '../components/TaskModal'
import CreateTaskModal from '../components/CreateTaskModal'

const COLUMNS = ['todo', 'in_progress', 'review', 'done']

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [project, setProject]         = useState(null)
  const [tasks, setTasks]             = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [createModal, setCreateModal]   = useState(null)
  const [filter, setFilter]           = useState({ priority: '', search: '' })
  const [showActivity, setShowActivity] = useState(false)
  const [liveAlert, setLiveAlert]     = useState(null)
  const alertTimeout = useRef(null)

  useEffect(() => { fetchData() }, [id])

  // ── Socket.io Real-time Setup ──────────────────────────
  useEffect(() => {
    if (!socket) return

    // Join this project's room
    socket.emit('join_project', id)
    console.log(`Joined project room: ${id}`)

    // Listen for real-time task events
    socket.on('task_created', (data) => {
      showAlert(`📋 New task created: "${data.title}"`)
      fetchTasks()
    })

    socket.on('task_updated', (data) => {
      setTasks(prev => prev.map(t =>
        t.id === parseInt(data.task_id)
          ? { ...t, status: data.status || t.status }
          : t
      ))
      if (data.status) {
        showAlert(`🔄 A task was moved to ${data.status.replace('_', ' ')}`)
      }
    })

    socket.on('task_deleted', (data) => {
      setTasks(prev => prev.filter(t => t.id !== parseInt(data.task_id)))
      showAlert('🗑 A task was deleted')
    })

    socket.on('comment_added', (data) => {
      showAlert(`💬 New comment on a task`)
    })

    return () => {
      socket.off('task_created')
      socket.off('task_updated')
      socket.off('task_deleted')
      socket.off('comment_added')
    }
  }, [socket, id])

  const showAlert = (message) => {
    setLiveAlert(message)
    if (alertTimeout.current) clearTimeout(alertTimeout.current)
    alertTimeout.current = setTimeout(() => setLiveAlert(null), 4000)
  }

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, logsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/projects/${id}/activity`)
      ])
      setProject(projRes.data.project)
      setTasks(tasksRes.data.tasks)
      setActivityLogs(logsRes.data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`)
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter.priority && t.priority !== filter.priority) return false
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status)

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId &&
        destination.index === source.index) return

    const newStatus = destination.droppableId
    setTasks(prev => prev.map(t =>
      t.id === parseInt(draggableId) ? { ...t, status: newStatus } : t
    ))

    try {
      await api.patch(`/tasks/${draggableId}`, { status: newStatus })
      // Emit to other users via socket
      socket?.emit('task_moved', {
        task_id: draggableId,
        status: newStatus,
        project_id: id
      })
      fetchData()
    } catch (err) {
      console.error(err)
      fetchData()
    }
  }

  const handleTaskClick = async (task) => {
    try {
      const res = await api.get(`/tasks/${task.id}`)
      setSelectedTask(res.data.task)
    } catch { setSelectedTask(task) }
  }

  const handleTaskCreated = () => fetchData()
  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const getActionIcon = (action) => {
    const icons = {
      task_created: '📋',
      task_moved: '🔄',
      project_created: '📁',
      comment_added: '💬',
    }
    return icons[action] || '📌'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading board...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Live Alert Toast */}
      {liveAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-bounce">
          <span>⚡</span> {liveAlert}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-700 text-sm font-medium transition"
              >
                ← Dashboard
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {project?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-base">{project?.name}</h1>
                <p className="text-xs text-gray-400">{project?.team_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="text-sm px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 w-44 transition"
              />
              <select
                value={filter.priority}
                onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
                className="text-sm px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              {/* Activity Feed Button */}
              <button
                onClick={() => setShowActivity(!showActivity)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition ${
                  showActivity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📜 Activity
                {activityLogs.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    showActivity ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activityLogs.length}
                  </span>
                )}
              </button>

              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                project?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {project?.status}
              </span>

              {/* Socket indicator */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-400">{socket?.connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-full">
        {/* Kanban Board */}
        <div className={`flex-1 p-6 transition-all duration-300 ${showActivity ? 'mr-80' : ''}`}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col}
                  columnId={col}
                  tasks={getTasksByStatus(col)}
                  onTaskClick={handleTaskClick}
                  onAddTask={(status) => setCreateModal(status)}
                  canAdd={true}
                />
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Activity Feed Sidebar */}
        {showActivity && (
          <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">📜 Activity Feed</h3>
              <button
                onClick={() => setShowActivity(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activityLogs.length === 0 ? (
                <div className="text-center py-10 text-gray-300 text-sm">
                  No activity yet
                </div>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-sm">{getActionIcon(log.action)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{log.user_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{log.details}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchData}
          onDelete={handleTaskDeleted}
          currentUser={user}
        />
      )}
      {createModal && (
        <CreateTaskModal
          projectId={id}
          defaultStatus={createModal}
          onClose={() => setCreateModal(null)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}