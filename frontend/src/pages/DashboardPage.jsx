import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchProjects(); fetchNotifications() }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/tasks/notifications')
      setNotifications(res.data.notifications || [])
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const unread = notifications.filter(n => !n.is_read).length
  const activeCount = projects.filter(p => p.status === 'active').length
  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activePct = projects.length > 0 ? Math.round((activeCount / projects.length) * 100) : 0
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  const statusStyle = {
    active:    'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    on_hold:   'bg-amber-50 text-amber-700',
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-[260px] shrink-0 flex flex-col" style={{ backgroundColor: '#1a2235' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-3 py-2">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Main</p>
          {[
            { to: '/dashboard', icon: '📊', label: 'Dashboard', count: projects.length },
            { to: '/teams',     icon: '👥', label: 'My Tasks',  count: totalTasks },
            { to: '/teams',     icon: '📅', label: 'Calendar' },
          ].map((item, i) => {
            const active = location.pathname === item.to && i === 0
            return (
              <Link key={i} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
                style={{
                  backgroundColor: active ? '#2d3f5e' : 'transparent',
                  color: active ? '#ffffff' : '#8b9ab8'
                }}>
                <span className="text-base">{item.icon}</span>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: active ? '#3d5280' : '#253047',
                      color: active ? '#93c5fd' : '#6b7a99'
                    }}>
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}

          <p className="px-3 py-2 mt-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Workspace</p>
          {[
            { to: '/teams',    icon: '👥', label: 'Teams' },
            ...(user?.role === 'admin' || user?.role === 'manager'
              ? [{ to: '/admin', icon: '📊', label: 'Reports' }] : []),
            ...(user?.role === 'admin'
              ? [{ to: '/admin', icon: '⚙️', label: 'Admin Settings' }] : []),
          ].map((item, i) => {
            const active = location.pathname === item.to
            return (
              <Link key={i} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
                style={{
                  backgroundColor: active ? '#2d3f5e' : 'transparent',
                  color: active ? '#ffffff' : '#8b9ab8'
                }}>
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Settings link for ALL users */}
          <Link to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
            style={{
              backgroundColor: location.pathname === '/settings' ? '#2d3f5e' : 'transparent',
              color: location.pathname === '/settings' ? '#ffffff' : '#8b9ab8'
            }}>
            <span className="text-base">⚙️</span>
            <span className="font-medium">Settings</span>
          </Link>
        </div>

        {/* ── User Section at Bottom ── */}
        <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid #253047' }}>

          {/* User Card */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-white hover:bg-opacity-5"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
                <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
              </div>
              <span className="text-gray-500 text-xs">▲</span>
            </button>

            {/* Popup Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5 inline-block ${
                        user?.role === 'admin' ? 'bg-red-100 text-red-600' :
                        user?.role === 'manager' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                  >
                    <span>👤</span> View Profile
                  </button>

                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/settings') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                  >
                    <span>⚙️</span> Settings
                  </button>

                  {/* Change Password — available to ALL users */}
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/settings?tab=password') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                  >
                    <span>🔒</span> Change Password
                  </button>

                  {/* Admin Panel — only for admin */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/admin') }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <span>🛡️</span> Admin Panel
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout() }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition text-left"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Overview</span>
          <div className="flex items-center gap-2">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition relative"
                style={{ borderColor: '#e8eaf0' }}>
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden"
                  style={{ borderColor: '#e8eaf0' }}>
                  <div className="px-4 py-3 flex justify-between items-center"
                    style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <span className="text-sm font-semibold text-gray-800">Notifications</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{unread} unread</span>
                      {unread > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await api.patch('/tasks/notifications/read')
                              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                            } catch (err) { console.error(err) }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-xs text-gray-400">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50' : ''}`}
                          style={{ borderBottom: '1px solid #f5f6fa' }}>
                          <div className="flex items-start gap-2">
                            {!n.is_read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                            <div>
                              <p className="text-xs text-gray-700">{n.message}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[13px] text-gray-500 hover:bg-gray-50 transition font-medium"
              style={{ borderColor: '#e8eaf0' }}>
              🔍 Search
            </button>

            {/* New Project */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition">
                + New project
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-[26px] font-bold text-gray-900">
              Good day, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">
              {today} · Here's what's happening across your projects
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">
            {[
              { icon: '📁', label: 'Total projects',  value: projects.length, pct: 80,        badge: '+1 this month',       iconBg: '#eff6ff', iconColor: '#2563eb', barColor: '#2563eb' },
              { icon: '🚀', label: 'Active projects', value: activeCount,     pct: activePct,  badge: `${activePct}% active`, iconBg: '#f0fdf4', iconColor: '#16a34a', barColor: '#22c55e' },
              { icon: '✅', label: 'Total tasks',     value: totalTasks,      pct: 60,         badge: 'across all',          iconBg: '#faf5ff', iconColor: '#9333ea', barColor: '#a855f7' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                    {c.icon}
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                    {c.badge}
                  </span>
                </div>
                <div className="text-[40px] font-bold text-gray-900 leading-none mb-1">{c.value}</div>
                <div className="text-[13px] text-gray-500 mb-5">{c.label}</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${c.pct}%`, backgroundColor: c.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Projects Header + Filter */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-gray-900">Your projects</h2>
            <div className="flex gap-1.5">
              {['all', 'active', 'completed', 'on_hold'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition border"
                  style={filter === f
                    ? { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                    : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e8eaf0' }}>
                  {f === 'on_hold' ? 'On hold' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border animate-pulse" style={{ borderColor: '#e8eaf0' }}>
                  <div className="w-10 h-10 rounded-xl mb-5" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-3.5 rounded mb-2 w-3/4" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-3 rounded w-1/2 mb-5" style={{ backgroundColor: '#f8f8fa' }} />
                  <div className="h-1.5 rounded mb-5" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-3 rounded w-full" style={{ backgroundColor: '#f8f8fa' }} />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed"
              style={{ borderColor: '#d1d5db' }}>
              <p className="text-4xl mb-3">📂</p>
              <p className="text-sm font-semibold text-gray-500">No projects found</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">Try a different filter or create a new project</p>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Link to="/projects/new"
                  className="bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition">
                  Create project
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => {
                const taskCount = parseInt(project.task_count) || 0
                const progress = project.status === 'completed'
                  ? 100 : Math.min(Math.round((taskCount / 5) * 100), 95)
                const barColor = project.status === 'completed' ? '#22c55e' : '#2563eb'
                return (
                  <Link key={project.id} to={`/projects/${project.id}`}
                    className="bg-white rounded-2xl p-6 transition-all duration-150 group block hover:shadow-md"
                    style={{ border: '1px solid #e8eaf0' }}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {project.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusStyle[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] text-gray-400 font-medium">Progress</span>
                        <span className="text-[12px] font-bold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4"
                      style={{ borderTop: '1px solid #f5f6fa' }}>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        👥 {project.team_name || 'No team'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        📋 {project.task_count} {parseInt(project.task_count) === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}