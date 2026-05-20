import { useState } from 'react'
import api from '../services/api'

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
}

export default function TaskModal({ task, onClose, onUpdate, onDelete, currentUser }) {
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localTask, setLocalTask] = useState(task)

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: comment })
      const res = await api.get(`/tasks/${task.id}`)
      setLocalTask(res.data.task)
      setComment('')
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${task.id}`)
      onDelete(task.id)
      onClose()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[localTask.priority]}`}>
                {localTask.priority}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {localTask.status?.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">{localTask.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl ml-4 leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Description */}
          {localTask.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
              <p className="text-sm text-gray-600">{localTask.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Assigned To</p>
              <p className="text-sm text-gray-700">{localTask.assigned_to_name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</p>
              <p className="text-sm text-gray-700">
                {localTask.due_date
                  ? new Date(localTask.due_date).toLocaleDateString()
                  : 'No deadline'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Created By</p>
              <p className="text-sm text-gray-700">{localTask.created_by_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {new Date(localTask.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
              Comments ({localTask.comments?.length || 0})
            </p>

            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
              {localTask.comments?.length === 0 && (
                <p className="text-sm text-gray-300 text-center py-4">No comments yet</p>
              )}
              {localTask.comments?.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {c.user_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-600">{c.user_name}</p>
                    <p className="text-sm text-gray-700">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !comment.trim()}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            🗑 Delete Task
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}