// DashboardPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

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

  // ── Search state ──
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => { fetchProjects(); fetchNotifications() }, [])

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
    }
  }, [showSearch])

  // Close search on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowSearch(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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

  // ── Search results ──
  const searchResults = searchQuery.trim().length === 0 ? [] : projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusStyle = {
    active:    'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    on_hold:   'bg-amber-50 text-amber-700',
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks',  count: totalTasks },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  const workspaceNav = [
    { to: '/teams', icon: 'ti-users', label: 'Teams' },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ to: '/reports', icon: 'ti-chart-bar', label: 'Reports' }]
      : []),
    ...(user?.role === 'admin' ? [
      { to: '/admin',    icon: 'ti-shield',   label: 'Admin Settings' },
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ] : []),
  ]

  return (
    <div className="flex min-h-screen">

      {/* ── Search Modal ── */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ border: '1px solid #e8eaf0' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid #f0f1f5' }}>
              <i className="ti ti-search text-gray-400 text-[18px] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, description or team..."
                className="flex-1 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="text-gray-300 hover:text-gray-500 transition">
                  <i className="ti ti-x text-sm" />
                </button>
              )}
              <kbd className="text-[11px] px-2 py-0.5 rounded-lg font-medium text-gray-400"
                style={{ backgroundColor: '#f0f1f5', border: '1px solid #e8eaf0' }}>
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Projects</p>
                  {projects.slice(0, 5).map(p => (
                    <button key={p.id}
                      onClick={() => { navigate(`/projects/${p.id}`); setShowSearch(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{p.team_name || 'No team'}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-10">
                  <i className="ti ti-search-off text-3xl text-gray-200 block mb-2" />
                  <p className="text-[13px] text-gray-400">No projects found for <span className="font-semibold text-gray-600">"{searchQuery}"</span></p>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map(p => (
                    <button key={p.id}
                      onClick={() => { navigate(`/projects/${p.id}`); setShowSearch(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {p.description || 'No description'} · {p.team_name || 'No team'}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 flex items-center gap-4" style={{ borderTop: '1px solid #f0f1f5', backgroundColor: '#fafafa' }}>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: '#f0f1f5', border: '1px solid #e8eaf0' }}>↵</kbd>
                to open
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: '#f0f1f5', border: '1px solid #e8eaf0' }}>Esc</kbd>
                to close
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5 ml-auto">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: '#f0f1f5', border: '1px solid #e8eaf0' }}>⌘K</kbd>
                to open anywhere
              </span>
            </div>
          </div>
        </div>
      )}

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

        <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid #253047' }}>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-white/5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
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

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Overview</span>
          <div className="flex items-center gap-2">

            {/* Bell */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} aria-label="Notifications"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{
                  backgroundColor: unread > 0 ? '#fef3c7' : '#f3f4f6',
                  border: `1.5px solid ${unread > 0 ? '#f59e0b' : '#d1d5db'}`,
                  color: unread > 0 ? '#d97706' : '#374151',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = unread > 0 ? '#fde68a' : '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = unread > 0 ? '#fef3c7' : '#f3f4f6'}>
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
                        <button
                          onClick={async () => {
                            try {
                              await api.patch('/tasks/notifications/read')
                              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                            } catch (err) { console.error(err) }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition">
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

            {/* ✅ Search button — now opens modal */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] text-gray-500 hover:bg-gray-50 transition font-medium"
              style={{ border: '1px solid #e8eaf0' }}>
              <i className="ti ti-search text-sm" /> Search
              <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-medium text-gray-300"
                style={{ backgroundColor: '#f0f1f5', border: '1px solid #e8eaf0' }}>⌘K</kbd>
            </button>

            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition">
                <i className="ti ti-plus text-sm" /> New project
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-[26px] font-bold text-gray-900">
              Good day, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">
              {today} · Here's what's happening across your projects
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">
            {[
              { icon: 'ti-folder',    label: 'Total projects',  value: projects.length, pct: Math.min((projects.length / 10) * 100, 100), badge: '+1 this month',        iconBg: '#eff6ff', iconColor: '#2563eb', barColor: '#2563eb' },
              { icon: 'ti-rocket',    label: 'Active projects', value: activeCount,     pct: activePct,                                    badge: `${activePct}% active`, iconBg: '#f0fdf4', iconColor: '#16a34a', barColor: '#22c55e' },
              { icon: 'ti-checklist', label: 'Total tasks',     value: totalTasks,      pct: Math.min((totalTasks / 20) * 100, 100),       badge: 'across all',           iconBg: '#faf5ff', iconColor: '#9333ea', barColor: '#a855f7' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                    <i className={`ti ${c.icon}`} />
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

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-gray-900">Your projects</h2>
            <div className="flex gap-1.5">
              {['all', 'active', 'completed', 'on_hold'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
                  style={filter === f
                    ? { backgroundColor: '#2563eb', color: '#fff', border: '1px solid #2563eb' }
                    : { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e8eaf0' }
                  }>
                  {f === 'on_hold' ? 'On hold' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="w-10 h-10 rounded-xl mb-5" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-4 rounded mb-2 w-3/4" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-3 rounded w-1/2 mb-5" style={{ backgroundColor: '#f8f8fa' }} />
                  <div className="h-1.5 rounded mb-5" style={{ backgroundColor: '#f0f1f5' }} />
                  <div className="h-3 rounded" style={{ backgroundColor: '#f8f8fa' }} />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed" style={{ borderColor: '#d1d5db' }}>
              <i className="ti ti-folder-open text-4xl text-gray-300 block mb-3" />
              <p className="text-sm font-semibold text-gray-500">No projects found</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                {filter === 'all' ? 'Create your first project to get started' : 'Try a different filter'}
              </p>
              {(user?.role === 'admin' || user?.role === 'manager') && filter === 'all' && (
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
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {project.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusStyle[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[12px] text-gray-400 font-medium">Progress</span>
                        <span className="text-[12px] font-bold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3.5" style={{ borderTop: '1px solid #f5f6fa' }}>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <i className="ti ti-users text-[13px]" />
                        {project.team_name || 'No team'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <i className="ti ti-clipboard-list text-[13px]" />
                        {project.task_count} {parseInt(project.task_count) === 1 ? 'task' : 'tasks'}
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