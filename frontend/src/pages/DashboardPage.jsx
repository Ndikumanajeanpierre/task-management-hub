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

const HamburgerIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
)

const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar
  return `http://localhost:5000${avatar}`
}

const Avatar = ({ user, size = 8 }) => {
  const avatarUrl = getAvatarUrl(user?.avatar)
  const initials  = user?.name?.charAt(0)?.toUpperCase() || 'U'
  const px        = size * 4
  return (
    <div style={{
      width: px, height: px, borderRadius: 10,
      backgroundColor: '#3b82f6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      fontSize: px * 0.35, fontWeight: 700, color: '#fff',
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : initials}
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [projects, setProjects]               = useState([])
  const [notifications, setNotifications]     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showNotif, setShowNotif]             = useState(false)
  const [showUserMenu, setShowUserMenu]       = useState(false)
  const [showSidebar, setShowSidebar]         = useState(false)
  const [filter, setFilter]                   = useState('all')
  const [showSearch, setShowSearch]           = useState(false)
  const [searchQuery, setSearchQuery]         = useState('')
  const [navigatingNotif, setNavigatingNotif] = useState(null)
  const searchInputRef = useRef(null)
  const notifRef       = useRef(null)

  useEffect(() => { fetchProjects(); fetchNotifications() }, [])

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50)
    else setSearchQuery('')
  }, [showSearch])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setShowSidebar(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showSidebar ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showSidebar])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false); setShowSidebar(false)
        setShowNotif(false); setShowUserMenu(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotif && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotif])

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

  const markAllRead = async () => {
    try {
      await api.patch('/tasks/notifications/read')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) { console.error(err) }
  }

  // ── Navigate to correct page when notification is clicked ──
  const handleNotifClick = async (n) => {
    setShowNotif(false)
    setNavigatingNotif(n.id)

    try {
      // task_assigned, task_updated, comment — fetch task to get project_id
      if (
        n.type === 'task_assigned' ||
        n.type === 'task_updated'  ||
        n.type === 'comment'
      ) {
        if (n.reference_id) {
          try {
            const res = await api.get(`/tasks/${n.reference_id}`)
            const task = res.data.task
            if (task?.project_id) {
              navigate(`/projects/${task.project_id}`)
              return
            }
          } catch {
            // task may be deleted — fall through
          }
        }
      }

      // system notifications — reference_id IS the project_id
      if (n.type === 'system') {
        if (n.reference_id) {
          navigate(`/projects/${n.reference_id}`)
          return
        }
      }

      // project_created, project_archived, project_updated
      if (
        n.type === 'project_created'  ||
        n.type === 'project_archived' ||
        n.type === 'project_updated'
      ) {
        if (n.reference_id) {
          navigate(`/projects/${n.reference_id}`)
          return
        }
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Notification navigation error:', err)
      navigate('/dashboard')
    } finally {
      setNavigatingNotif(null)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const unread           = notifications.filter(n => !n.is_read).length
  const activeCount      = projects.filter(p => p.status === 'active').length
  const totalTasks       = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activePct        = projects.length > 0 ? Math.round((activeCount / projects.length) * 100) : 0
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter)

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
      ? [{ to: '/reports', icon: 'ti-chart-bar', label: 'Reports' }] : []),
    ...(user?.role === 'admin' ? [
      { to: '/admin',    icon: 'ti-shield',   label: 'Admin Settings' },
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ] : [
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ]),
  ]

  const getNotifIcon = (type) => {
    const icons = {
      task_assigned:    { icon: '📋', bg: '#eff6ff', color: '#2563eb' },
      task_updated:     { icon: '🔄', bg: '#faf5ff', color: '#9333ea' },
      comment:          { icon: '💬', bg: '#fefce8', color: '#ca8a04' },
      comment_added:    { icon: '💬', bg: '#fefce8', color: '#ca8a04' },
      project_created:  { icon: '📁', bg: '#f0fdf4', color: '#16a34a' },
      project_archived: { icon: '📦', bg: '#fff7ed', color: '#ea580c' },
      project_updated:  { icon: '✏️', bg: '#f0f9ff', color: '#0284c7' },
      system:           { icon: '🔔', bg: '#f0fdf4', color: '#16a34a' },
    }
    return icons[type] || { icon: '🔔', bg: '#f3f4f6', color: '#6b7280' }
  }

  const isClickable = (type) => [
    'task_assigned', 'task_updated', 'comment', 'comment_added',
    'project_created', 'project_archived', 'project_updated', 'system'
  ].includes(type)

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1a2235' }}>
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid #253047' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>
        <button onClick={() => setShowSidebar(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: '#6b7a99' }}>Main</p>
        {mainNav.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to}
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
              style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#fff' : '#8b9ab8' }}>
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

        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: '#6b7a99' }}>Workspace</p>
        {workspaceNav.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to}
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
              style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#fff' : '#8b9ab8' }}>
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
            <Avatar user={user} size={8} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
            </div>
            <i className={`ti ${showUserMenu ? 'ti-chevron-down' : 'ti-chevron-up'} text-xs`}
              style={{ color: '#6b7a99' }} />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100"
                style={{ background: 'linear-gradient(to right, #eff6ff, #eef2ff)' }}>
                <div className="flex items-center gap-3">
                  <Avatar user={user} size={10} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${
                      user?.role === 'admin'   ? 'bg-red-100 text-red-600' :
                      user?.role === 'manager' ? 'bg-purple-100 text-purple-600' :
                                                 'bg-green-100 text-green-600'
                    }`}>{user?.role}</span>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {[
                  { icon: 'ti-user',     label: 'View Profile',   action: () => { setShowUserMenu(false); setShowSidebar(false); navigate('/profile') } },
                  { icon: 'ti-settings', label: 'Settings',        action: () => { setShowUserMenu(false); navigate('/settings') } },
                  { icon: 'ti-lock',     label: 'Change Password', action: () => { setShowUserMenu(false); navigate('/settings?tab=password') } },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <i className={`ti ${item.icon} text-base text-gray-400`} /> {item.label}
                  </button>
                ))}
                {user?.role === 'admin' && (
                  <button onClick={() => { setShowUserMenu(false); setShowSidebar(false); navigate('/admin') }}
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
    </div>
  )

  return (
    <div className="flex min-h-screen">

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ border: '1px solid #e8eaf0' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid #f0f1f5' }}>
              <i className="ti ti-search text-gray-400 text-[18px] shrink-0" />
              <input ref={searchInputRef} type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="flex-1 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500">
                  <i className="ti ti-x text-sm" />
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
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
                        <p className="text-[11px] text-gray-400">{p.team_name || 'No team'}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusStyle[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-10">
                  <i className="ti ti-search-off text-3xl text-gray-200 block mb-2" />
                  <p className="text-[13px] text-gray-400">No projects found for <strong>"{searchQuery}"</strong></p>
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusStyle[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(1px)' }}
          onClick={() => setShowSidebar(false)}>
          <div className="absolute top-0 left-0 h-full w-[260px] sm:w-[280px] shadow-2xl"
            style={{ animation: 'slideInLeft 0.22s cubic-bezier(0.4,0,0.2,1)' }}
            onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col fixed top-0 left-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]"
        style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-4 lg:px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowSidebar(prev => !prev)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">
              <HamburgerIcon open={showSidebar} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">T</div>
            </div>
            <span className="hidden lg:block text-[15px] font-semibold text-gray-800">Overview</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search */}
            <button onClick={() => setShowSearch(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] text-gray-500 hover:bg-gray-50 transition font-medium"
              style={{ border: '1px solid #e8eaf0' }}>
              <i className="ti ti-search text-sm" /> Search
            </button>
            <button onClick={() => setShowSearch(true)}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              style={{ border: '1px solid #e8eaf0' }}>
              <i className="ti ti-search text-sm" />
            </button>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition relative"
                style={{
                  backgroundColor: unread > 0 ? '#fef3c7' : '#f3f4f6',
                  border: `1.5px solid ${unread > 0 ? '#f59e0b' : '#d1d5db'}`,
                  color: unread > 0 ? '#d97706' : '#374151',
                }}>
                <BellIcon />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-[17px] h-[17px] text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#ef4444', border: '2px solid #fff' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="fixed sm:absolute z-50 bg-white rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    border: '1px solid #e8eaf0',
                    top: window.innerWidth < 640 ? '64px' : 'calc(100% + 8px)',
                    right: window.innerWidth < 640 ? '0' : '0',
                    left: window.innerWidth < 640 ? '8px' : 'auto',
                    width: window.innerWidth < 640 ? 'calc(100vw - 16px)' : '360px',
                    maxHeight: '80vh',
                  }}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10"
                    style={{ borderBottom: '1px solid #f0f1f5' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">Notifications</span>
                      {unread > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-600">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 transition">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotif(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                    {notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="text-4xl mb-3">🔔</div>
                        <p className="text-sm font-semibold text-gray-400">No notifications yet</p>
                        <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n, i) => {
                        const { icon, bg, color } = getNotifIcon(n.type)
                        const clickable = isClickable(n.type) && n.reference_id
                        const isLoading = navigatingNotif === n.id
                        return (
                          <div key={n.id}
                            onClick={() => clickable && handleNotifClick(n)}
                            className="px-4 py-3.5 transition"
                            style={{
                              borderBottom: i < notifications.length - 1 ? '1px solid #f5f6fa' : 'none',
                              backgroundColor: !n.is_read ? '#f0f7ff' : '#fff',
                              cursor: clickable ? 'pointer' : 'default',
                            }}
                            onMouseEnter={e => { if (clickable) e.currentTarget.style.backgroundColor = '#e8f4fd' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = !n.is_read ? '#f0f7ff' : '#fff' }}>
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                                style={{ backgroundColor: bg, color }}>
                                {isLoading ? <i className="ti ti-loader animate-spin text-sm" /> : icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-gray-800 leading-relaxed font-medium">{n.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                      stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12,6 12,12 16,14"/>
                                    </svg>
                                    {new Date(n.created_at).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                  {clickable && (
                                    <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5">
                                      View <i className="ti ti-arrow-right text-[10px]" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              {!n.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 sticky bottom-0"
                      style={{ borderTop: '1px solid #f0f1f5' }}>
                      <p className="text-center text-xs text-gray-400">
                        {notifications.length} total · {unread} unread
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New Project */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new"
                className="flex items-center gap-1.5 px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition">
                <i className="ti ti-plus text-sm" />
                <span className="hidden sm:inline">New project</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-gray-900">
              Good day, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1">{today}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-7 sm:mb-9">
            {[
              { icon: 'ti-folder',    label: 'Total projects',  value: projects.length, pct: Math.min((projects.length / 10) * 100, 100), badge: '+1 this month',        iconBg: '#eff6ff', iconColor: '#2563eb', barColor: '#2563eb' },
              { icon: 'ti-rocket',    label: 'Active projects', value: activeCount,     pct: activePct,                                    badge: `${activePct}% active`, iconBg: '#f0fdf4', iconColor: '#16a34a', barColor: '#22c55e' },
              { icon: 'ti-checklist', label: 'Total tasks',     value: totalTasks,      pct: Math.min((totalTasks / 50) * 100, 100),       badge: 'across all',           iconBg: '#faf5ff', iconColor: '#9333ea', barColor: '#a855f7' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #e8eaf0' }}>
                <div className="flex justify-between items-start mb-4 sm:mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                    <i className={`ti ${c.icon}`} />
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>{c.badge}</span>
                </div>
                <div className="text-[32px] sm:text-[38px] font-bold text-gray-900 leading-none mb-1">{c.value}</div>
                <div className="text-[12px] sm:text-[13px] text-gray-500 mb-4 sm:mb-5">{c.label}</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Projects Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Your projects</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {['all', 'active', 'completed', 'on_hold'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap shrink-0"
                  style={filter === f
                    ? { backgroundColor: '#2563eb', color: '#fff', border: '1px solid #2563eb' }
                    : { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e8eaf0' }}>
                  {f === 'on_hold' ? 'On hold' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1,2,3].map(i => (
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
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-dashed"
              style={{ borderColor: '#d1d5db' }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProjects.map(project => {
                const taskCount = parseInt(project.task_count) || 0
                const progress  = project.status === 'completed' ? 100 : Math.min(Math.round((taskCount / 5) * 100), 95)
                const barColor  = project.status === 'completed' ? '#22c55e' : '#2563eb'
                return (
                  <Link key={project.id} to={`/projects/${project.id}`}
                    className="bg-white rounded-2xl p-5 sm:p-6 transition-all duration-150 group block hover:shadow-md"
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
                    <p className="text-[14px] font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition line-clamp-1">
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
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3.5" style={{ borderTop: '1px solid #f5f6fa' }}>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium min-w-0">
                        <i className="ti ti-users text-[13px] shrink-0" />
                        <span className="truncate">{project.team_name || 'No team'}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium shrink-0 ml-2">
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

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  )
}