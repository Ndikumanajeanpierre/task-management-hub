import { useState, useEffect } from 'react'
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
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    labels: task.labels || '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => { fetchAttachments() }, [])

  const fetchAttachments = async () => {
    try {
      const res = await api.get('/tasks/' + task.id + '/attachments')
      setAttachments(res.data.attachments)
    } catch (err) { console.error(err) }
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await api.patch('/tasks/' + task.id, editForm)
      const res = await api.get('/tasks/' + task.id)
      setLocalTask(res.data.task)
      setEditing(false)
      setSaveMsg('✅ Task updated!')
      setTimeout(() => setSaveMsg(''), 3000)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error(err)
      setSaveMsg('❌ Failed to update task.')
      setTimeout(() => setSaveMsg(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await api.post('/tasks/' + task.id + '/comments', { content: comment })
      const res = await api.get('/tasks/' + task.id)
      setLocalTask(res.data.task)
      setComment('')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post('/tasks/' + task.id + '/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchAttachments()
    } catch (err) { console.error('Upload error:', err) }
    finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete('/tasks/' + task.id)
      onDelete(task.id)
      onClose()
    } catch (err) { console.error(err) }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase()
    if (['png','jpg','jpeg'].includes(ext)) return '🖼️'
    if (ext === 'pdf') return '📄'
    if (['doc','docx'].includes(ext)) return '📝'
    if (ext === 'zip') return '📦'
    return '📎'
  }

  const getDownloadUrl = (filePath) => {
    if (!filePath) return '#'
    const normalized = filePath.replace(/\\/g, '/')
    return 'http://localhost:5000/' + normalized
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + priorityColors[localTask.priority]}>
                {localTask.priority}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {localTask.status?.replace('_', ' ')}
              </span>
              {localTask.labels && localTask.labels.split(',').map((label, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  {label.trim()}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-800">{localTask.title}</h2>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setEditing(!editing)}
              className={"text-xs font-semibold px-3 py-1.5 rounded-lg transition " + (editing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Save Message */}
        {saveMsg && (
          <div className={"mx-6 mt-4 px-4 py-2 rounded-xl text-sm font-medium " + (saveMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
            {saveMsg}
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="p-6 border-b border-gray-100 bg-blue-50 space-y-4">
            <p className="text-sm font-bold text-blue-700 mb-2">✏️ Editing Task</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows={3}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                <select
                  name="priority"
                  value={editForm.priority}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={editForm.due_date}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Labels</label>
                <input
                  type="text"
                  name="labels"
                  value={editForm.labels}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="frontend, bug, urgent"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.title.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition text-sm"
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {[
            { id: 'details', label: 'Details' },
            { id: 'comments', label: 'Comments (' + (localTask.comments?.length || 0) + ')' },
            { id: 'attachments', label: 'Files (' + attachments.length + ')' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"px-4 py-2 text-sm font-semibold rounded-t-lg transition " + (activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {localTask.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{localTask.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Assigned To', value: localTask.assigned_to_name || 'Unassigned' },
                  { label: 'Due Date', value: localTask.due_date ? new Date(localTask.due_date).toLocaleDateString() : 'No deadline' },
                  { label: 'Created By', value: localTask.created_by_name },
                  { label: 'Created', value: new Date(localTask.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
              {localTask.labels && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Labels</p>
                  <div className="flex flex-wrap gap-2">
                    {localTask.labels.split(',').map((label, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-100">
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(!localTask.comments || localTask.comments.length === 0) && (
                  <div className="text-center py-8 text-gray-300 text-sm">No comments yet</div>
                )}
                {localTask.comments?.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{c.user_name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-gray-700">{c.user_name}</p>
                        <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 text-sm px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !comment.trim()}
                  className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                <div className="text-center">
                  {uploading ? (
                    <div className="text-blue-500 text-sm font-semibold animate-pulse">Uploading...</div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-1">📎</div>
                      <p className="text-sm font-semibold text-gray-500">Click to upload a file</p>
                      <p className="text-xs text-gray-300 mt-1">PDF, DOC, PNG, JPG, ZIP — max 10MB</p>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" />
              </label>
              {attachments.length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-sm">No files attached yet</div>
              ) : (
                <div className="space-y-2">
                  {attachments.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <span className="text-2xl flex-shrink-0">{getFileIcon(a.file_name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{a.file_name || 'Unnamed file'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatFileSize(a.file_size)} · {a.uploaded_by_name} · {new Date(a.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a href={getDownloadUrl(a.file_path)} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 font-semibold px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex-shrink-0">
                        ⬇ Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            🗑 Delete Task
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}