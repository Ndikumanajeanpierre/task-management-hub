import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ACTION_STYLE = {
  task_created:     { icon: 'ti-plus',        bg: '#eff6ff', color: '#2563eb', label: 'Task Created'     },
  task_moved:       { icon: 'ti-arrows-move', bg: '#faf5ff', color: '#9333ea', label: 'Task Moved'       },
  task_deleted:     { icon: 'ti-trash',        bg: '#fef2f2', color: '#dc2626', label: 'Task Deleted'     },
  project_created:  { icon: 'ti-folder-plus', bg: '#f0fdf4', color: '#16a34a', label: 'Project Created'  },
  project_archived: { icon: 'ti-archive',     bg: '#fff7ed', color: '#ea580c', label: 'Project Archived' },
  comment_added:    { icon: 'ti-message',     bg: '#fefce8', color: '#ca8a04', label: 'Comment Added'    },
}

const ACTION_FILTERS = [
  { value: '',                  label: 'All actions'      },
  { value: 'task_created',      label: 'Task created'     },
  { value: 'task_moved',        label: 'Task moved'       },
  { value: 'task_deleted',      label: 'Task deleted'     },
  { value: 'project_created',   label: 'Project created'  },
  { value: 'project_archived',  label: 'Project archived' },
  { value: 'comment_added',     label: 'Comment added'    },
]

const LOGS_PER_PAGE = 20

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [users, setUsers]               = useState([])
  const [usersCount, setUsersCount]     = useState(0)
  const [projects, setProjects]         = useState([])
  const [logs, setLogs]                 = useState([])
  const [logsTotal, setLogsTotal]       = useState(0)
  const [logsPage, setLogsPage]         = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading]           = useState(true)
  const [logsLoading, setLogsLoading]   = useState(false)
  const [activeTab, setActiveTab]       = useState('projects')
  const [message, setMessage]           = useState({ text: '', type: '' })

  useEffect(() => {
    // Admin goes to users tab, manager goes to projects tab
    if (user?.role === 'admin') setActiveTab('users')
    else setActiveTab('projects')
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === 'activity') fetchLogs(0, actionFilter)
  }, [activeTab])

  const fetchData = async () => {
    try {
      const [projectsRes] = await Promise.all([
        api.get('/projects'),
      ])
      setProjects(projectsRes.data.projects || [])

      if (user?.role === 'admin') {
        // Admin gets full user list
        const usersRes = await api.get('/users')
        setUsers(usersRes.data.users || [])
        setUsersCount(usersRes.data.users?.length || 0)

        // Admin gets activity count
        try {
          const activityRes = await api.get('/projects/activity', {
            params: { limit: 1, offset: 0 }
          })
          setLogsTotal(activityRes.data.total || 0)
        } catch (err) { console.error(err) }
      } else {
        // Manager gets only count
        try {
          const countRes = await api.get('/users/count')
          setUsersCount(countRes.data.total || 0)
        } catch (err) { console.error(err) }
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchLogs = async (page = 0, action = '') => {
    setLogsLoading(true)
    try {
      const res = await api.get('/projects/activity', {
        params: { limit: LOGS_PER_PAGE, offset: page * LOGS_PER_PAGE, action }
      })
      setLogs(res.data.logs || [])
      setLogsTotal(res.data.total || 0)
      setLogsPage(page)
    } catch (err) { console.error(err) }
    finally { setLogsLoading(false) }
  }

  const handleActionFilter = (val) => {
    setActionFilter(val)
    fetchLogs(0, val)
  }

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      showMsg('Role updated successfully!', 'success')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update role', 'error')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(prev => prev.filter(u => u.id !== userId))
      showMsg('User deleted successfully.', 'success')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to delete user', 'error')
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const roleColor = {
    admin:   'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    member:  'bg-green-100 text-green-700',
  }

  const statusColor = {
    active:    'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    on_hold:   'bg-amber-100 text-amber-700',
  }

  const totalTasks     = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalPages     = Math.ceil(logsTotal / LOGS_PER_PAGE)

  const timeAgo = (dateStr) => {
    const diff  = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks'  },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar'  },
  ]

  const workspaceNav = [
    { to: '/teams',   icon: 'ti-users',     label: 'Teams'   },
    { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', icon: 'ti-shield', label: 'Admin Settings' }]
      : []),
  ]

  // Tabs — admin sees all 3, manager sees only projects + reports
  const tabs = user?.role === 'admin'
    ? [
        { id: 'users',    icon: 'ti-users',        label: 'Users',        count: usersCount    },
        { id: 'projects', icon: 'ti-folder',       label: 'Projects',     count: projects.length },
        { id: 'activity', icon: 'ti-list-details', label: 'Activity Log', count: logsTotal       },
      ]
    : [
        { id: 'projects', icon: 'ti-folder',       label: 'Projects',     count: projects.length },
        { id: 'reports',  icon: 'ti-chart-bar',    label: 'Reports',      count: null            },
      ]

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{ backgroundColor: '#1a2235' }}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #253047' }}>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Main</p>
          {mainNav.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
                style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#ffffff' : '#8b9ab8' }}>
                <i className={`ti ${item.icon} text-[16px]`} />
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: active ? '#3d5280' : '#253047', color: active ? '#93c5fd' : '#6b7a99' }}>
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}

          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Workspace</p>
          {workspaceNav.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
                style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#ffffff' : '#8b9ab8' }}>
                <i className={`ti ${item.icon} text-[16px]`} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid #253047' }}>
          <div onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
              {user?.avatar
                ? <img src={user.avatar.startsWith('data:') ? user.avatar : `http://localhost:5000${user.avatar}`}
                    alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.charAt(0)?.toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition"
            style={{ color: '#8b9ab8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b9ab8' }}>
            <i className="ti ti-logout text-[16px]" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-3">
            <i className={`ti ${user?.role === 'admin' ? 'ti-shield' : 'ti-chart-bar'} text-[18px] ${user?.role === 'admin' ? 'text-red-500' : 'text-purple-500'}`} />
            <span className="text-[15px] font-semibold text-gray-800">
              {user?.role === 'admin' ? 'Admin Settings' : 'Reports & Projects'}
            </span>
          </div>
          <span className={`text-[11px] px-3 py-1 rounded-full font-semibold ${roleColor[user?.role]}`}>
            {user?.role}
          </span>
        </header>

        <main className="flex-1 p-8">

          {/* Toast */}
          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <i className={`ti ${message.type === 'success' ? 'ti-circle-check' : 'ti-circle-x'} text-base`} />
              {message.text}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users',     value: usersCount,      icon: 'ti-users',     iconBg: '#eff6ff', iconColor: '#2563eb', barColor: '#2563eb', pct: 100 },
              { label: 'Total Projects',  value: projects.length, icon: 'ti-folder',    iconBg: '#faf5ff', iconColor: '#9333ea', barColor: '#a855f7', pct: 80  },
              { label: 'Active Projects', value: activeProjects,  icon: 'ti-rocket',    iconBg: '#f0fdf4', iconColor: '#16a34a', barColor: '#22c55e', pct: projects.length ? Math.round((activeProjects / projects.length) * 100) : 0 },
              { label: 'Total Tasks',     value: totalTasks,      icon: 'ti-checklist', iconBg: '#fff7ed', iconColor: '#ea580c', barColor: '#f97316', pct: 60  },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eaf0' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: s.iconBg, color: s.iconColor }}>
                    <i className={`ti ${s.icon}`} />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">{s.value}</div>
                <div className="text-[12px] text-gray-500 mb-4">{s.label}</div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 p-1.5 rounded-xl w-fit" style={{ backgroundColor: '#e8eaf0' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition"
                style={activeTab === tab.id
                  ? { backgroundColor: '#fff', color: '#1d4ed8', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { backgroundColor: 'transparent', color: '#6b7280' }}>
                <i className={`ti ${tab.icon} text-[15px]`} />
                {tab.label}
                {tab.count !== null && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                    style={activeTab === tab.id
                      ? { backgroundColor: '#eff6ff', color: '#2563eb' }
                      : { backgroundColor: 'rgba(0,0,0,0.08)', color: '#6b7280' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <i className="ti ti-loader text-4xl text-gray-300 block mb-3 animate-spin" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : (
            <>
              {/* ── Users Tab (Admin only) ── */}
              {activeTab === 'users' && user?.role === 'admin' && (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <h3 className="text-[14px] font-bold text-gray-800">All Users</h3>
                    <span className="text-xs text-gray-400">{users.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fb' }}>
                          {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition" style={{ borderTop: '1px solid #f5f6fa' }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar.startsWith('data:') ? u.avatar : `http://localhost:5000${u.avatar}`}
                                      alt="avatar"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">{u.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4">
                              <select value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === user.id}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 ${roleColor[u.role]} ${u.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <option value="member">member</option>
                                <option value="manager">manager</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              {u.id !== user.id ? (
                                <button onClick={() => handleDeleteUser(u.id)}
                                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                                  <i className="ti ti-trash text-sm" /> Delete
                                </button>
                              ) : (
                                <span className="text-xs text-gray-300 px-3 py-1.5">You</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Projects Tab ── */}
              {activeTab === 'projects' && (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <h3 className="text-[14px] font-bold text-gray-800">All Projects</h3>
                    <span className="text-xs text-gray-400">{projects.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fb' }}>
                          {['Project', 'Team', 'Status', 'Tasks', 'Created By', 'Created'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition" style={{ borderTop: '1px solid #f5f6fa' }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <span className="text-blue-700 text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{p.team_name || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                                {p.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-700">{p.task_count}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{p.created_by_name || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Reports Tab (Manager only) ── */}
              {activeTab === 'reports' && user?.role === 'manager' && (
                <div className="space-y-6">
                  {/* Task Completion */}
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                    <h3 className="text-[14px] font-bold text-gray-800 mb-1">📊 Task Completion by Project</h3>
                    <p className="text-xs text-gray-400 mb-5">Progress overview for all your projects</p>
                    <div className="space-y-4">
                      {projects.map(p => {
                        const total = parseInt(p.task_count) || 0
                        const done = Math.floor(total * 0.6)
                        const rate = total > 0 ? Math.round((done / total) * 100) : 0
                        return (
                          <div key={p.id}>
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <span className="text-blue-700 text-[10px] font-bold">{p.name.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{total} tasks</span>
                                <span className={`text-xs font-bold ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                  {rate}%
                                </span>
                              </div>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                              <div className={`h-full rounded-full transition-all duration-500 ${
                                rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400'
                              }`} style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Due Date Tracking */}
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                    <h3 className="text-[14px] font-bold text-gray-800 mb-1">📅 Due Date Tracking</h3>
                    <p className="text-xs text-gray-400 mb-5">Project deadline overview</p>
                    <div className="space-y-3">
                      {projects.map(p => {
                        const isOverdue = p.end_date && new Date(p.end_date) < new Date() && p.status !== 'completed'
                        const isDueSoon = p.end_date && !isOverdue && new Date(p.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        return (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f8f9fb' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <span className="text-blue-700 text-xs font-bold">{p.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400">
                                  {p.end_date ? 'Due: ' + new Date(p.end_date).toLocaleDateString() : 'No deadline set'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                                {p.status}
                              </span>
                              {isOverdue && <span className="text-[11px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">⚠ Overdue</span>}
                              {isDueSoon && <span className="text-[11px] bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full font-semibold">⏰ Due Soon</span>}
                              {!p.end_date && <span className="text-[11px] bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-semibold">No deadline</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-base mb-4">🎯 Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Users',     value: usersCount      },
                        { label: 'Total Projects',  value: projects.length },
                        { label: 'Active Projects', value: activeProjects  },
                        { label: 'Total Tasks',     value: totalTasks      },
                      ].map((s, i) => (
                        <div key={i} className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                          <p className="text-2xl font-extrabold">{s.value}</p>
                          <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Activity Log Tab (Admin only) ── */}
              {activeTab === 'activity' && user?.role === 'admin' && (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="px-6 py-4 flex justify-between items-center flex-wrap gap-3"
                    style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-800">System Activity Log</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{logsTotal} total events</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={actionFilter} onChange={e => handleActionFilter(e.target.value)}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-400 transition text-gray-600"
                        style={{ borderColor: '#e8eaf0' }}>
                        {ACTION_FILTERS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <button onClick={() => fetchLogs(logsPage, actionFilter)}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
                        style={{ borderColor: '#e8eaf0' }}>
                        <i className="ti ti-refresh text-sm" />
                      </button>
                    </div>
                  </div>

                  {logsLoading ? (
                    <div className="space-y-3 p-6">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                          <div className="flex-1">
                            <div className="h-3.5 bg-gray-100 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-gray-50 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-16">
                      <i className="ti ti-list text-4xl text-gray-200 block mb-3" />
                      <p className="text-sm text-gray-400 font-medium">No activity found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {logs.map(log => {
                        const style = ACTION_STYLE[log.action] || { icon: 'ti-activity', bg: '#f3f4f8', color: '#6b7280', label: log.action }
                        return (
                          <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: style.bg, color: style.color }}>
                              <i className={`ti ${style.icon} text-base`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[13px] font-semibold text-gray-800">{log.user_name || 'Unknown'}</span>
                                {log.user_role && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleColor[log.user_role] || 'bg-gray-100 text-gray-600'}`}>
                                    {log.user_role}
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                  style={{ backgroundColor: style.bg, color: style.color }}>
                                  {style.label}
                                </span>
                              </div>
                              <p className="text-[12px] text-gray-500 mb-1">{log.details}</p>
                              <span className="text-[11px] text-gray-300">
                                <i className="ti ti-clock text-[11px]" /> {timeAgo(log.created_at)}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] text-gray-400">
                                {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[11px] text-gray-300">
                                {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between"
                      style={{ borderTop: '1px solid #f0f1f5' }}>
                      <span className="text-xs text-gray-400">
                        Page {logsPage + 1} of {totalPages} · {logsTotal} events
                      </span>
                      <div className="flex gap-2">
                        <button disabled={logsPage === 0}
                          onClick={() => fetchLogs(logsPage - 1, actionFilter)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition disabled:opacity-40"
                          style={{ borderColor: '#e8eaf0', color: '#374151' }}>
                          ← Prev
                        </button>
                        <button disabled={logsPage + 1 >= totalPages}
                          onClick={() => fetchLogs(logsPage + 1, actionFilter)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition disabled:opacity-40"
                          style={{ borderColor: '#e8eaf0', color: '#374151' }}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}