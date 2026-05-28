import { useState, useEffect } from 'react'
import api from '../services/api'

export default function CreateTaskModal({ projectId, defaultStatus, onClose, onCreated, currentUser }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: defaultStatus || 'todo',
    labels: '',
    assigned_to: currentUser?.role === 'member' ? String(currentUser?.id) : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState([])

  useEffect(() => {
    fetchProjectMembers()
  }, [])

  const fetchProjectMembers = async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`)
      const teamId = projRes.data.project?.team_id
      if (teamId) {
        const teamRes = await api.get(`/teams/${teamId}`)
        setMembers(teamRes.data.team?.members || [])
      }
    } catch (err) {
      console.error('Failed to fetch members:', err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        project_id: projectId,
        assigned_to: form.assigned_to || null,
      }
      const res = await api.post('/tasks', payload)
      onCreated(res.data.task)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Assign To
            </label>
            {currentUser?.role === 'member' ? (
              <div className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 flex items-center gap-2">
                <span>👤</span>
                <span>Assigned to you automatically</span>
              </div>
            ) : (
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Labels
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input
              type="text"
              name="labels"
              value={form.labels}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g. frontend, bug, urgent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-bold"
          >
            {loading ? '⏳ Creating...' : '✅ Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}