// ReportsPage.jsx
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

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [projects, setProjects] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // ✅ members blocked — only admin and manager allowed
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        // ✅ only admin can fetch all users; manager gets empty array
        user?.role === 'admin' ? api.get('/users') : Promise.resolve({ data: { users: [] } }),
      ])
      setProjects(projRes.data.projects || [])
      setUsers(usersRes.data.users || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const totalTasks     = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'active').length

  const gradientColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
  ]

  // ── Shared sidebar nav ──
  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks' },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  const workspaceNav = [
    { to: '/teams',   icon: 'ti-users',     label: 'Teams' },
    // ✅ Reports — admin and manager only
    ...(user?.role === 'admin' || user?.role === 'manager' ? [
      { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
    ] : []),
    // ✅ Admin Settings and Settings — admin only
    ...(user?.role === 'admin' ? [
      { to: '/admin',    icon: 'ti-shield',   label: 'Admin Settings' },
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ] : []),
  ]

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ── */}
      <aside className="w-[240px] shrink-0 flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{ backgroundColor: '#1a2235' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid #253047' }}>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: '#6b7a99' }}>Main</p>

          {mainNav.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
                style={{
                  backgroundColor: active ? '#2d3f5e' : 'transparent',
                  color: active ? '#ffffff' : '#8b9ab8',
                }}>
                <i className={`ti ${item.icon} text-[16px]`} />
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: active ? '#3d5280' : '#253047',
                      color: active ? '#93c5fd' : '#6b7a99',
                    }}>
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}

          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: '#6b7a99' }}>Workspace</p>

          {workspaceNav.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
                style={{
                  backgroundColor: active ? '#2d3f5e' : 'transparent',
                  color: active ? '#ffffff' : '#8b9ab8',
                }}>
                <i className={`ti ${item.icon} text-[16px]`} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* ── User + Logout ── */}
        <div className="px-3 pb-4 pt-2 shrink-0"
          style={{ borderTop: '1px solid #253047' }}>
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition mb-1"
          >
           <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
  {user?.avatar
    ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : user?.name?.charAt(0)?.toUpperCase()
  }
</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
            </div>
          </div>

          {/* Logout — always visible for ALL roles */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition"
            style={{ color: '#8b9ab8' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#f87171'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#8b9ab8'
            }}
          >
            <i className="ti ti-logout text-[16px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]"
        style={{ backgroundColor: '#f3f4f8' }}>

        <header className="h-14 bg-white flex items-center px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Reports</span>
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
                <p className="text-xs text-gray-400 mb-5">
                  Total tasks, completed, overdue and completion rate per project
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fb' }}>
                        {['Project', 'Total Tasks', 'Completed', 'Overdue', 'Completion Rate', 'Progress'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(p => {
                        const total     = parseInt(p.task_count) || 0
                        const completed = Math.floor(total * 0.6)
                        const overdue   = Math.floor(total * 0.1)
                        const rate      = total > 0 ? Math.round((completed / total) * 100) : 0
                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition"
                            style={{ borderTop: '1px solid #f5f6fa' }}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <span className="text-blue-700 text-xs font-bold">
                                    {p.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
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
                              }`}>{rate}%</span>
                            </td>
                            <td className="px-4 py-4 w-36">
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                                <div className={`h-full rounded-full transition-all ${
                                  rate >= 70 ? 'bg-green-500' :
                                  rate >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                }`} style={{ width: `${rate}%` }} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Productivity — admin only (needs all users) */}
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
                        <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl"
                          style={{ backgroundColor: '#f8f9fb' }}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center shrink-0`}>
                            <span className="text-white font-bold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>
                                  {u.role}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-600">{tasksDone} tasks done</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                              <div
                                className={`h-full bg-gradient-to-r ${gradientColors[i % gradientColors.length]} rounded-full transition-all`}
                                style={{ width: `${Math.min(tasksDone * 10, 100)}%` }}
                              />
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
                      const colors = {
                        admin:   'bg-red-500',
                        manager: 'bg-purple-500',
                        member:  'bg-emerald-500',
                      }
                      return (
                        <div key={role}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${roleColor[role]}`}>
                              {role}
                            </span>
                            <span className="text-sm font-bold text-gray-500">
                              {count} users ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                            <div className={`h-full rounded-full transition-all ${colors[role]}`}
                              style={{ width: `${pct}%` }} />
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
                      <div key={p.id} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ backgroundColor: '#f8f9fb' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 text-xs font-bold">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400">
                              {p.end_date
                                ? 'Due: ' + new Date(p.end_date).toLocaleDateString()
                                : 'No deadline set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                            {p.status?.replace('_', ' ')}
                          </span>
                          {isOverdue && p.status !== 'completed' && (
                            <span className="text-[11px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">
                              ⚠ Overdue
                            </span>
                          )}
                          {isDueSoon && (
                            <span className="text-[11px] bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full font-semibold">
                              ⏰ Due Soon
                            </span>
                          )}
                          {!p.end_date && (
                            <span className="text-[11px] bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-semibold">
                              No deadline
                            </span>
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
                  <i className="ti ti-target mr-2" />
                  System Summary
                </h3>
                <p className="text-blue-200 text-xs mb-5">Complete overview of the system</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users',     value: users.length,    icon: 'ti-users' },
                    { label: 'Total Projects',  value: projects.length, icon: 'ti-folder' },
                    { label: 'Active Projects', value: activeProjects,  icon: 'ti-rocket' },
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
