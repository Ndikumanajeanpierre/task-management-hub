import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PRIORITY_STYLE = {
  critical: { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
  high:     { bg: '#fff7ed', text: '#ea580c', dot: '#ea580c' },
  medium:   { bg: '#fefce8', text: '#ca8a04', dot: '#ca8a04' },
  low:      { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
}

const STATUS_STYLE = {
  todo:        { bg: '#f3f4f8', text: '#6b7280', label: 'To Do' },
  in_progress: { bg: '#eff6ff', text: '#2563eb', label: 'In Progress' },
  review:      { bg: '#faf5ff', text: '#9333ea', label: 'Review' },
  done:        { bg: '#f0fdf4', text: '#16a34a', label: 'Done' },
}

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

export default function TasksPage() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [tasks, setTasks]               = useState([])
  const [projects, setProjects]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all')
  const [priority, setPriority]         = useState('all')
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState('due_date')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSidebar, setShowSidebar]   = useState(false)

  useEffect(() => { fetchData() }, [])

  // Close sidebar on route change
  useEffect(() => { setShowSidebar(false) }, [location.pathname])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksRes, projRes] = await Promise.all([
        api.get('/tasks/my'),
        api.get('/projects'),
      ])
      setTasks(tasksRes.data.tasks || [])
      setProjects(projRes.data.projects || [])
    } catch (err) {
      console.error('fetchData error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)

  const filtered = tasks
    .filter(t => {
      if (filter !== 'all' && t.status !== filter) return false
      if (priority !== 'all' && t.priority !== priority) return false
      if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'due_date') return new Date(a.due_date || '9999') - new Date(b.due_date || '9999')
      if (sortBy === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
      }
      if (sortBy === 'title') return a.title?.localeCompare(b.title)
      return 0
    })

  const counts = {
    all:         tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review:      tasks.filter(t => t.status === 'review').length,
    done:        tasks.filter(t => t.status === 'done').length,
  }

  const overdue = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length

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
    ...(user?.role === 'admin'
      ? [{ to: '/admin', icon: 'ti-shield', label: 'Admin Settings' }] : []),
    { to: '/settings', icon: 'ti-settings', label: 'Settings' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1a2235' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid #253047' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>
        <button onClick={() => setShowSidebar(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Main</p>
        {mainNav.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to}
              onClick={() => setShowSidebar(false)}
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
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition mb-0.5"
              style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#ffffff' : '#8b9ab8' }}>
              <i className={`ti ${item.icon} text-[16px]`} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User menu */}
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
                  { icon: 'ti-settings', label: 'Settings',        action: () => { setShowUserMenu(false); setShowSidebar(false); navigate('/settings') } },
                  { icon: 'ti-lock',     label: 'Change Password', action: () => { setShowUserMenu(false); setShowSidebar(false); navigate('/settings?tab=password') } },
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

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSidebar(false)}>
          <div className="w-[260px] h-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col fixed top-0 left-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar — bell removed, only hamburger + title + search + sort */}
        <header className="h-14 bg-white flex items-center justify-between px-4 lg:px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button onClick={() => setShowSidebar(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
              style={{ border: '1.5px solid #e8eaf0', color: '#374151' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="text-[15px] font-semibold text-gray-800">My Tasks</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" placeholder="Search tasks..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-[13px] rounded-xl border focus:outline-none focus:border-blue-400 transition"
                style={{ borderColor: '#e8eaf0', width: 180 }} />
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 text-[13px] rounded-xl border focus:outline-none transition"
              style={{ borderColor: '#e8eaf0' }}>
              <option value="due_date">Sort: Due date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">

          {/* Search — mobile only */}
          <div className="sm:hidden mb-4 relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Search tasks..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-[13px] rounded-xl border focus:outline-none focus:border-blue-400 transition bg-white"
              style={{ borderColor: '#e8eaf0' }} />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            {[
              { label: 'Total tasks', value: tasks.length,       icon: 'ti-checklist',     color: '#2563eb', bg: '#eff6ff' },
              { label: 'In progress', value: counts.in_progress, icon: 'ti-loader',         color: '#9333ea', bg: '#faf5ff' },
              { label: 'Due today',   value: tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()).length, icon: 'ti-clock', color: '#ca8a04', bg: '#fefce8' },
              { label: 'Overdue',     value: overdue,            icon: 'ti-alert-triangle', color: '#dc2626', bg: '#fef2f2' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 lg:p-5 flex items-center gap-3 lg:gap-4"
                style={{ border: '1px solid #e8eaf0' }}>
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-base lg:text-lg shrink-0"
                  style={{ backgroundColor: s.bg, color: s.color }}>
                  <i className={`ti ${s.icon}`} />
                </div>
                <div>
                  <div className="text-[20px] lg:text-[24px] font-bold text-gray-900 leading-none">{s.value}</div>
                  <div className="text-[11px] lg:text-[12px] text-gray-400 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Status + priority filters */}
          <div className="flex gap-2 mb-5 lg:mb-6 flex-wrap">
            {[
              { key: 'all',         label: 'All' },
              { key: 'todo',        label: 'To Do' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'review',      label: 'Review' },
              { key: 'done',        label: 'Done' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition border"
                style={filter === f.key
                  ? { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                  : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e8eaf0' }}>
                {f.label} <span className="ml-1 opacity-70">{counts[f.key] ?? tasks.length}</span>
              </button>
            ))}
            <div className="ml-auto flex gap-1.5 flex-wrap">
              {['all', 'critical', 'high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition border"
                  style={priority === p
                    ? { backgroundColor: PRIORITY_STYLE[p]?.bg || '#f3f4f8', color: PRIORITY_STYLE[p]?.text || '#374151', borderColor: PRIORITY_STYLE[p]?.text || '#374151' }
                    : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e8eaf0' }}>
                  {p === 'all' ? 'All priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded bg-gray-100" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-50 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 lg:py-20 bg-white rounded-2xl border border-dashed"
              style={{ borderColor: '#d1d5db' }}>
              <i className="ti ti-checklist text-5xl text-gray-200 block mb-3" />
              <p className="text-sm font-semibold text-gray-400">No tasks found</p>
              <p className="text-xs text-gray-300 mt-1">
                {tasks.length === 0 ? 'No tasks have been assigned to you yet' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(task => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                const p = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium
                const s = STATUS_STYLE[task.status]     || STATUS_STYLE.todo
                return (
                  <div key={task.id}
                    className="bg-white rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 flex items-center gap-3 lg:gap-4 group transition hover:shadow-sm"
                    style={{ border: '1px solid #e8eaf0' }}>
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                      style={{ borderColor: task.status === 'done' ? '#22c55e' : '#d1d5db', backgroundColor: task.status === 'done' ? '#22c55e' : 'transparent' }}>
                      {task.status === 'done' && <i className="ti ti-check text-white" style={{ fontSize: 10 }} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/projects/${task.project_id}`}
                          className={`text-[13px] font-semibold transition ${task.status === 'done' ? 'line-through text-gray-300' : 'text-gray-800 hover:text-blue-600'}`}>
                          {task.title}
                        </Link>
                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-500">Overdue</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {task.project_name && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <i className="ti ti-folder text-[11px]" />{task.project_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                            <i className="ti ti-calendar text-[11px]" />
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.priority && (
                        <span className="hidden sm:flex text-[11px] px-2.5 py-1 rounded-full font-semibold items-center gap-1"
                          style={{ backgroundColor: p.bg, color: p.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                          {task.priority}
                        </span>
                      )}
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                      <select value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] px-2 py-1 rounded-lg border opacity-0 group-hover:opacity-100 transition focus:outline-none"
                        style={{ borderColor: '#e8eaf0' }}>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}