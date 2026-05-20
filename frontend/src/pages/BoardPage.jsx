import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import KanbanColumn from '../components/KanbanColumn'
import TaskModal from '../components/TaskModal'
import CreateTaskModal from '../components/CreateTaskModal'

const COLUMNS = ['todo', 'in_progress', 'review', 'done']

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject]       = useState(null)
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [createModal, setCreateModal]   = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ])
      setProject(projRes.data.project)
      setTasks(tasksRes.data.tasks)
    } catch (err) {
      console.error('Failed to load board:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTasksByStatus = (status) =>
    tasks.filter(t => t.status === status)

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId &&
        destination.index === source.index) return

    const newStatus = destination.droppableId

    // Optimistic UI update
    setTasks(prev => prev.map(t =>
      t.id === parseInt(draggableId) ? { ...t, status: newStatus } : t
    ))

    try {
      await api.patch(`/tasks/${draggableId}`, { status: newStatus })
    } catch (err) {
      console.error('Failed to update task:', err)
      fetchData() // revert on error
    }
  }

  const handleTaskClick = async (task) => {
    try {
      const res = await api.get(`/tasks/${task.id}`)
      setSelectedTask(res.data.task)
    } catch (err) {
      setSelectedTask(task)
    }
  }

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask])
    fetchData() // refresh to get full task data
  }

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-lg">Loading board...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ← Back
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{project?.name}</h1>
                <p className="text-xs text-gray-400">{project?.team_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                project?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {project?.status}
              </span>
              <span className="text-sm text-gray-500">{tasks.length} tasks</span>
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchData}
          onDelete={handleTaskDeleted}
          currentUser={user}
        />
      )}

      {/* Create Task Modal */}
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