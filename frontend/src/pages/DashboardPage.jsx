import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotif, setShowNotif] = useState(false)
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
    active:    'bg-teal-50 text-teal-800',
    completed: 'bg-blue-50 text-blue-800',
    on_hold:   'bg-amber-50 text-amber-800',
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">T</div>
          <span className="text-[15px] font-medium text-gray-900">Task Hub</span>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3">
          <p className="px-4 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Main</p>
          {[
            { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
            { to: '/projects',  icon: 'ti-folder',           label: 'Projects',  count: projects.length },
            { to: '/tasks',     icon: 'ti-checklist',         label: 'My Tasks',  count: totalTasks },
            { to: '/calendar',  icon: 'ti-calendar',          label: 'Calendar' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-2.5 mx-1 px-3 py-2.5 rounded-lg text-[13px] transition mb-0.5
                ${location.pathname === item.to
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
            >
              <i className={`ti ${item.icon} text-base`} />
              <span className="flex-1">{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  location.pathname === item.to ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{item.count}</span>
              )}
            </Link>
          ))}

          <p className="px-4 py-2 mt-2 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Workspace</p>
          {[
            { to: '/teams',   icon: 'ti-users',    label: 'Teams' },
            { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
            ...(user?.role === 'admin' ? [{ to: '/admin', icon: 'ti-settings', label: 'Settings' }] : []),
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-2.5 mx-1 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition mb-0.5"
            >
              <i className={`ti ${item.icon} text-base`} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleLogout() }}
              className="text-gray-300 hover:text-red-500 transition">
              <i className="ti ti-logout text-base" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-7 sticky top-0 z-30">
          <span className="text-[15px] font-medium text-gray-900">Overview</span>
          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                aria-label="Notifications"
              >
                <i className="ti ti-bell text-[17px]" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">Notifications</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{unread} unread</span>
                      {unread > 0 && (
                        <button onClick={async () => {
                          try {
                            await api.patch('/tasks/notifications/read')
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                          } catch (err) { console.error(err) }
                        }} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-0.5 rounded hover:bg-blue-50 transition">
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-xs text-gray-400">No notifications</p>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
                        <div className="flex items-start gap-2">
                          {!n.is_read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                          <div>
                            <p className="text-xs text-gray-700">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition">
              <i className="ti ti-search text-sm" /> Search
            </button>

            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition">
                <i className="ti ti-plus text-sm" /> New project
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-7">

          {/* Page header */}
          <div className="mb-7">
            <h1 className="text-[22px] font-medium text-gray-900">
              Good day, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">{today} · Here's what's happening across your projects</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'ti-folder',    label: 'Total projects',  value: projects.length, pct: 80,       badge: '+1 this month', ic: 'text-blue-600',   bg: 'bg-blue-50',   bar: 'bg-blue-600' },
              { icon: 'ti-rocket',    label: 'Active projects', value: activeCount,     pct: activePct, badge: `${activePct}% active`, ic: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-600' },
              { icon: 'ti-checklist', label: 'Total tasks',     value: totalTasks,      pct: 60,       badge: 'across all',   ic: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-600' },
            ].map((c, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg} ${c.ic}`}>
                    <i className={`ti ${c.icon}`} />
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 text-green-800 font-medium">{c.badge}</span>
                </div>
                <div className="text-[36px] font-medium text-gray-900 leading-none mb-1">{c.value}</div>
                <div className="text-[13px] text-gray-500 mb-4">{c.label}</div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Projects header + filter */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-medium text-gray-900">Your projects</h2>
            <div className="flex gap-1.5">
              {['all', 'active', 'completed', 'on_hold'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    filter === f
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {f === 'on_hold' ? 'On hold' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Projects grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl mb-4" />
                  <div className="h-3.5 bg-gray-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2 mb-4" />
                  <div className="h-1 bg-gray-100 rounded mb-4" />
                  <div className="h-3 bg-gray-50 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <i className="ti ti-folder-open text-4xl text-gray-300 block mb-3" />
              <p className="text-sm font-medium text-gray-500">No projects found</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">Try a different filter or create a new project</p>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Link to="/projects/new" className="bg-blue-600 text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
                  Create project
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => {
                const taskCount = parseInt(project.task_count) || 0
                const progress = project.status === 'completed' ? 100 : Math.min(Math.round((taskCount / 5) * 100), 95)
                return (
                  <Link key={project.id} to={`/projects/${project.id}`}
                    className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-300 transition-all duration-150 group block"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center text-sm font-medium">
                        {project.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyle[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-[14px] font-medium text-gray-900 mb-1.5 group-hover:text-blue-600 transition">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] text-gray-400">Progress</span>
                        <span className="text-[11px] text-gray-600 font-medium">{progress}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${project.status === 'completed' ? 'bg-teal-500' : 'bg-blue-600'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 border-t border-gray-50">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <i className="ti ti-users text-[13px]" />
                        {project.team_name || 'No team'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <i className="ti ti-clipboard-list text-[13px]" />
                        {project.task_count} tasks
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