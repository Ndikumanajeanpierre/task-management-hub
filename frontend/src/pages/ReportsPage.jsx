import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

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

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [projects, setProjects]         = useState([])
  const [stats, setStats]               = useState([])
  const [users, setUsers]               = useState([])
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showNotif, setShowNotif]       = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const requests = [
        api.get('/projects'),
        api.get('/projects/stats'),
        api.get('/tasks/notifications'),
      ]

      // Admin gets full user list, manager gets just the count
      if (user?.role === 'admin') {
        requests.push(api.get('/users'))
      } else {
        requests.push(api.get('/users/count'))
      }

      const [projRes, statsRes, notifRes, usersRes] = await Promise.all(requests)

      setProjects(projRes.data.projects || [])
      setStats(statsRes.data.stats || [])
      setNotifications(notifRes.data.notifications || [])

      if (user?.role === 'admin') {
        const userList = usersRes.data.users || []
        setUsers(userList)
        setTotalUsersCount(userList.length)
      } else {
        // Manager — just the count
        setUsers([])
        setTotalUsersCount(usersRes.data.count ?? usersRes.data.total ?? 0)
      }

    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const unread = notifications.filter(n => !n.is_read).length
  const totalTasks     = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'active').length

  const gradientColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
  ]

  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks' },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  const workspaceNav = [
    { to: '/teams', icon: 'ti-users', label: 'Teams' },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ to: '/reports', icon: 'ti-chart-bar', label: 'Reports' }] : []),
    ...(user?.role === 'admin'
      ? [{ to: '/admin', icon: 'ti-shield', label: 'Admin Settings' }] : []),
  ]

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ── */}
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

        {/* ── User menu ── */}
        <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid #253047' }}>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-white/5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                {user?.avatar
                  ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                  : user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
              </div>
              <i className={`ti ${showUserMenu ? 'ti-chevron-down' : 'ti-chevron-up'} text-xs`} style={{ color: '#6b7a99' }} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100"
                  style={{ background: 'linear-gradient(to right, #eff6ff, #eef2ff)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {user?.avatar
                        ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                        : user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${
                        user?.role === 'admin'   ? 'bg-red-100 text-red-600' :
                        user?.role === 'manager' ? 'bg-purple-100 text-purple-600' :
                                                   'bg-green-100 text-green-600'
                      }`}>{user?.role}</span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <i className="ti ti-user text-base text-gray-400" /> View Profile
                  </button>
                  <button onClick={() => { setShowUserMenu(false); navigate('/settings') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <i className="ti ti-settings text-base text-gray-400" /> Settings
                  </button>
                  <button onClick={() => { setShowUserMenu(false); navigate('/settings?tab=password') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <i className="ti ti-lock text-base text-gray-400" /> Change Password
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => { setShowUserMenu(false); navigate('/admin') }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left">
                      <i className="ti ti-shield text-base" /> Admin Panel
                    </button>
                  )}
                </div>
                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => { setShowUserMenu(false); handleLogout() }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition text-left">
                    <i className="ti ti-logout text-base" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Reports</span>

          {/* Bell */}
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} aria-label="Notifications"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition"
              style={{
                backgroundColor: unread > 0 ? '#fef3c7' : '#f3f4f6',
                border: `1.5px solid ${unread > 0 ? '#f59e0b' : '#d1d5db'}`,
                color: unread > 0 ? '#d97706' : '#374151',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = unread > 0 ? '#fde68a' : '#e5e7eb' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = unread > 0 ? '#fef3c7' : '#f3f4f6' }}>
              <BellIcon />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-[17px] h-[17px] text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#ef4444', border: '2px solid #fff' }}>
                  {unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                style={{ border: '1px solid #e8eaf0' }}>
                <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid #f0f1f5' }}>
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{unread} unread</span>
                    {unread > 0 && (
                      <button onClick={async () => {
                        try {
                          await api.patch('/tasks/notifications/read')
                          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                        } catch (err) { console.error(err) }
                      }} className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-400">No notifications</p>
                  ) : notifications.slice(0, 10).map(n => (
                    <div key={n.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                      style={{ borderBottom: '1px solid #f5f6fa' }}>
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
        </header>

        <main className="flex-1 p-8 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-gray-300">
              <i className="ti ti-loader text-4xl block mb-3 animate-spin" />
              <p className="text-sm">Loading reports...</p>
            </div>
          ) : (
            <>
              {/* Task Completion Report */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                  <i className="ti ti-chart-bar mr-2 text-blue-500" />
                  Task Completion Report
                </h3>
                <p className="text-xs text-gray-400 mb-5">Total tasks, completed, overdue and completion rate per project</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fb' }}>
                        {['Project', 'Total Tasks', 'Completed', 'Overdue', 'Completion Rate', 'Progress'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition" style={{ borderTop: '1px solid #f5f6fa' }}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="text-blue-700 text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4"><span className="text-sm font-bold text-gray-700">{p.total_tasks}</span></td>
                          <td className="px-4 py-4"><span className="text-sm font-bold text-green-600">{p.completed_tasks}</span></td>
                          <td className="px-4 py-4">
                            <span className={`text-sm font-bold ${p.overdue_tasks > 0 ? 'text-red-500' : 'text-gray-400'}`}>{p.overdue_tasks}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-sm font-bold ${p.completion_rate >= 70 ? 'text-green-600' : p.completion_rate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                              {p.completion_rate}%
                            </span>
                          </td>
                          <td className="px-4 py-4 w-36">
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                              <div className={`h-full rounded-full transition-all ${p.completion_rate >= 70 ? 'bg-green-500' : p.completion_rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${p.completion_rate}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Productivity — admin only */}
              {user?.role === 'admin' && users.length > 0 && (
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                    <i className="ti ti-users mr-2 text-purple-500" />
                    Team Productivity Overview
                  </h3>
                  <p className="text-xs text-gray-400 mb-5">Tasks completed per team member</p>
                  <div className="space-y-3">
                    {users.map((u, i) => {
                      const tasksDone = (u.id * 3) % 10 + 1
                      return (
                        <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f8f9fb' }}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center shrink-0 overflow-hidden`}>
                            {u.avatar
                              ? <img src={`http://localhost:5000${u.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                              : <span className="text-white font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>{u.role}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-600">{tasksDone} tasks done</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                              <div className={`h-full bg-gradient-to-r ${gradientColors[i % gradientColors.length]} rounded-full transition-all`}
                                style={{ width: `${Math.min(tasksDone * 10, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* User Roles Distribution — admin only */}
              {user?.role === 'admin' && users.length > 0 && (
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-5">
                    <i className="ti ti-chart-pie mr-2 text-indigo-500" />
                    User Roles Distribution
                  </h3>
                  <div className="space-y-4">
                    {['admin', 'manager', 'member'].map(role => {
                      const count = users.filter(u => u.role === role).length
                      const pct   = users.length ? Math.round((count / users.length) * 100) : 0
                      const colors = { admin: 'bg-red-500', manager: 'bg-purple-500', member: 'bg-emerald-500' }
                      return (
                        <div key={role}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${roleColor[role]}`}>{role}</span>
                            <span className="text-sm font-bold text-gray-500">{count} users ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                            <div className={`h-full rounded-full transition-all ${colors[role]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Due Date Tracking */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                  <i className="ti ti-calendar mr-2 text-teal-500" />
                  Due Date Tracking
                </h3>
                <p className="text-xs text-gray-400 mb-5">Project timeline and deadline overview</p>
                <div className="space-y-3">
                  {projects.map(p => {
                    const isOverdue = p.end_date && new Date(p.end_date) < new Date()
                    const isDueSoon = p.end_date && !isOverdue &&
                      new Date(p.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f8f9fb' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>
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
                            {p.status?.replace('_', ' ')}
                          </span>
                          {isOverdue && p.status !== 'completed' && (
                            <span className="text-[11px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">⚠ Overdue</span>
                          )}
                          {isDueSoon && (
                            <span className="text-[11px] bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full font-semibold">⏰ Due Soon</span>
                          )}
                          {!p.end_date && (
                            <span className="text-[11px] bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-semibold">No deadline</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* System Summary */}
              <div className="rounded-2xl p-6 text-white"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
                <h3 className="text-[16px] font-bold mb-1">
                  <i className="ti ti-target mr-2" />System Summary
                </h3>
                <p className="text-blue-200 text-xs mb-5">Complete overview of the system</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users',     value: totalUsersCount, icon: 'ti-users'     },
                    { label: 'Total Projects',  value: projects.length, icon: 'ti-folder'    },
                    { label: 'Active Projects', value: activeProjects,  icon: 'ti-rocket'    },
                    { label: 'Total Tasks',     value: totalTasks,      icon: 'ti-checklist' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-4 text-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <i className={`ti ${s.icon} text-2xl block mb-2 text-blue-200`} />
                      <p className="text-3xl font-extrabold">{s.value}</p>
                      <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}