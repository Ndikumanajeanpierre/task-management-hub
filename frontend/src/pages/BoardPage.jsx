import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import KanbanColumn from '../components/KanbanColumn'
import TaskModal from '../components/TaskModal'
import CreateTaskModal from '../components/CreateTaskModal'

const COLUMNS = ['todo', 'in_progress', 'review', 'done']
const COLUMN_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' }

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [createModal, setCreateModal] = useState(null)
  const [filter, setFilter] = useState({ priority: '', search: '' })

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ])
      setProject(projRes.data.project)
      setTasks(tasksRes.data.tasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const newStatus = destination.droppableId
    setTasks(prev => prev.map(t => t.id === parseInt(draggableId) ? { ...t, status: newStatus } : t))
    try {
      await api.patch(`/tasks/${draggableId}`, { status: newStatus })
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
  const handleTaskDeleted = (taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))

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
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-700 text-sm font-medium transition flex items-center gap-1"
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
                <h1 className="font-bold text-gray-800 text-base leading-tight">{project?.name}</h1>
                <p className="text-xs text-gray-400">{project?.team_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="text-sm px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 w-48 transition"
              />
              {/* Priority Filter */}
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

              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                project?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {project?.status}
              </span>
              <span className="text-sm text-gray-400 font-medium">{tasks.length} tasks</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Board */}
      <div className="p-6">
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