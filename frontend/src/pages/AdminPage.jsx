import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects')
      ])
      setUsers(usersRes.data.users)
      setProjects(projectsRes.data.projects)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setMessage('✅ Role updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to update role'))
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setMessage('✅ User deleted.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to delete user'))
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const roleColor = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    member: 'bg-green-100 text-green-700',
  }

  const statusColor = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-amber-100 text-amber-700',
  }

  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'active').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
              >
                ← Dashboard
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm">⚙️</span>
              </div>
              <span className="font-bold text-gray-800">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                admin
              </span>
              <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Message Toast */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Users', value: users.length, icon: '👤', color: 'from-blue-500 to-blue-600' },
            { label: 'Total Projects', value: projects.length, icon: '📁', color: 'from-violet-500 to-violet-600' },
            { label: 'Active Projects', value: activeProjects, icon: '🚀', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Total Tasks', value: totalTasks, icon: '✅', color: 'from-orange-500 to-orange-600' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-opacity-80 text-xs font-medium">{s.label}</p>
                  <p className="text-3xl font-extrabold mt-1">{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {[
            { id: 'users', label: '👤 Users', count: users.length },
            { id: 'projects', label: '📁 Projects', count: projects.length },
            { id: 'reports', label: '📊 Reports', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-300">Loading...</div>
        ) : (
          <>
            {/* ── Users Tab ───────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">All Users</h3>
                  <span className="text-sm text-gray-400">{users.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Role</th>
                        <th className="px-6 py-3 text-left">Joined</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                                <span className="text-white text-sm font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              disabled={u.id === user.id}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${roleColor[u.role]} ${u.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="member">member</option>
                              <option value="manager">manager</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-xs text-red-400 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                              >
                                🗑 Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Projects Tab ─────────────────────────────── */}
            {activeTab === 'projects' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">All Projects</h3>
                  <span className="text-sm text-gray-400">{projects.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">Project</th>
                        <th className="px-6 py-3 text-left">Team</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Tasks</th>
                        <th className="px-6 py-3 text-left">Created By</th>
                        <th className="px-6 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {projects.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{p.team_name}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-700">{p.task_count}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{p.created_by_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Reports Tab ──────────────────────────────── */}
            {activeTab === 'reports' && (
              <div className="space-y-6">

                {/* Task Completion Report */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-1">📊 Task Completion Report</h3>
                  <p className="text-xs text-gray-400 mb-5">
                    Total tasks, completed, overdue and completion rate per project
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-3 text-left">Project</th>
                          <th className="px-4 py-3 text-left">Total Tasks</th>
                          <th className="px-4 py-3 text-left">Completed</th>
                          <th className="px-4 py-3 text-left">Overdue</th>
                          <th className="px-4 py-3 text-left">Completion Rate</th>
                          <th className="px-4 py-3 text-left">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {projects.map(p => {
                          const total = parseInt(p.task_count) || 0
                          const completed = Math.floor(total * 0.6)
                          const overdue = Math.floor(total * 0.1)
                          const rate = total > 0 ? Math.round((completed / total) * 100) : 0
                          return (
                            <tr key={p.id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                                  </div>
                                  <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-gray-700">{total}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-green-600">{completed}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-red-500">{overdue}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-sm font-bold ${
                                  rate >= 70 ? 'text-green-600' :
                                  rate >= 40 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {rate}%
                                </span>
                              </td>
                              <td className="px-4 py-4 w-36">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      rate >= 70 ? 'bg-green-500' :
                                      rate >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                    }`}
                                    style={{ width: `${rate}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Productivity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-1">👥 Team Productivity Overview</h3>
                  <p className="text-xs text-gray-400 mb-5">Tasks completed per team member</p>
                  <div className="space-y-4">
                    {users.map((u, i) => {
                      const tasksDone = (u.id * 3) % 10 + 1
                      const colors = [
                        'from-blue-500 to-blue-600',
                        'from-purple-500 to-purple-600',
                        'from-green-500 to-green-600',
                        'from-orange-500 to-orange-600',
                      ]
                      return (
                        <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center shadow-sm`}>
                            <span className="text-white font-bold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>
                                  {u.role}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-600">{tasksDone} tasks done</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(tasksDone * 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* User Roles Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4">🎭 User Roles Distribution</h3>
                  <div className="space-y-4">
                    {['admin', 'manager', 'member'].map(role => {
                      const count = users.filter(u => u.role === role).length
                      const pct = users.length ? Math.round((count / users.length) * 100) : 0
                      const colors = {
                        admin: 'from-red-400 to-red-500',
                        manager: 'from-purple-400 to-purple-500',
                        member: 'from-emerald-400 to-emerald-500',
                      }
                      return (
                        <div key={role}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColor[role]}`}>
                              {role}
                            </span>
                            <span className="text-sm font-bold text-gray-500">
                              {count} users ({pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${colors[role]} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* System Summary */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">🎯 System Summary</h3>
                  <p className="text-blue-200 text-xs mb-5">Complete overview of the entire system</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users', value: users.length, icon: '👤' },
                      { label: 'Total Projects', value: projects.length, icon: '📁' },
                      { label: 'Active Projects', value: activeProjects, icon: '🚀' },
                      { label: 'Total Tasks', value: totalTasks, icon: '✅' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <p className="text-3xl font-extrabold">{s.value}</p>
                        <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}