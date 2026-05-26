// AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [users, setUsers]         = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [message, setMessage]     = useState({ text: '', type: '' })

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects'),
      ])
      setUsers(usersRes.data.users || [])
      setProjects(projectsRes.data.projects || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
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

  // ── Sidebar nav (admin only page — admin sees everything) ──
  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks' },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  const workspaceNav = [
    { to: '/teams',    icon: 'ti-users',     label: 'Teams' },
    { to: '/reports',  icon: 'ti-chart-bar', label: 'Reports' },
    { to: '/admin',    icon: 'ti-shield',    label: 'Admin Settings' },
    { to: '/settings', icon: 'ti-settings',  label: 'Settings' },
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

        {/* User + Logout */}
        <div className="px-3 pb-4 pt-2 shrink-0"
          style={{ borderTop: '1px solid #253047' }}>
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition mb-1"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
            </div>
          </div>

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

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-3">
            <i className="ti ti-shield text-[18px] text-red-500" />
            <span className="text-[15px] font-semibold text-gray-800">Admin Settings</span>
          </div>
          <span className="text-[11px] px-3 py-1 rounded-full font-semibold bg-red-100 text-red-700">
            admin
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
              { label: 'Total Users',     value: users.length,    icon: 'ti-users',     iconBg: '#eff6ff', iconColor: '#2563eb', barColor: '#2563eb', pct: 100 },
              { label: 'Total Projects',  value: projects.length, icon: 'ti-folder',    iconBg: '#faf5ff', iconColor: '#9333ea', barColor: '#a855f7', pct: 80  },
              { label: 'Active Projects', value: activeProjects,  icon: 'ti-rocket',    iconBg: '#f0fdf4', iconColor: '#16a34a', barColor: '#22c55e', pct: projects.length ? Math.round((activeProjects / projects.length) * 100) : 0 },
              { label: 'Total Tasks',     value: totalTasks,      icon: 'ti-checklist', iconBg: '#fff7ed', iconColor: '#ea580c', barColor: '#f97316', pct: 60  },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5"
                style={{ border: '1px solid #e8eaf0' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: s.iconBg, color: s.iconColor }}>
                    <i className={`ti ${s.icon}`} />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">{s.value}</div>
                <div className="text-[12px] text-gray-500 mb-4">{s.label}</div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${s.pct}%`, backgroundColor: s.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 p-1.5 rounded-xl w-fit"
            style={{ backgroundColor: '#e8eaf0' }}>
            {[
              { id: 'users',    icon: 'ti-users',  label: 'Users',    count: users.length },
              { id: 'projects', icon: 'ti-folder', label: 'Projects', count: projects.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition"
                style={activeTab === tab.id
                  ? { backgroundColor: '#fff', color: '#1d4ed8', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { backgroundColor: 'transparent', color: '#6b7280' }
                }>
                <i className={`ti ${tab.icon} text-[15px]`} />
                {tab.label}
                <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={activeTab === tab.id
                    ? { backgroundColor: '#eff6ff', color: '#2563eb' }
                    : { backgroundColor: 'rgba(0,0,0,0.08)', color: '#6b7280' }
                  }>
                  {tab.count}
                </span>
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
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #e8eaf0' }}>
                  <div className="px-6 py-4 flex justify-between items-center"
                    style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <h3 className="text-[14px] font-bold text-gray-800">All Users</h3>
                    <span className="text-xs text-gray-400">{users.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fb' }}>
                          {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition"
                            style={{ borderTop: '1px solid #f5f6fa' }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                  <span className="text-white text-sm font-bold">
                                    {u.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4">
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === user.id}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 ${roleColor[u.role]} ${u.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                              {u.id !== user.id ? (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                                >
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

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #e8eaf0' }}>
                  <div className="px-6 py-4 flex justify-between items-center"
                    style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <h3 className="text-[14px] font-bold text-gray-800">All Projects</h3>
                    <span className="text-xs text-gray-400">{projects.length} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fb' }}>
                          {['Project', 'Team', 'Status', 'Tasks', 'Created By', 'Created'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition"
                            style={{ borderTop: '1px solid #f5f6fa' }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <span className="text-blue-700 text-xs font-bold">
                                    {p.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {p.team_name || '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                                {p.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-700">{p.task_count}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {p.created_by_name || '—'}
                            </td>
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
            </>
          )}
        </main>
      </div>
    </div>
  )
}