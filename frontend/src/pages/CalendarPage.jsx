// CalendarPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const PRIORITY_COLOR = {
  critical: '#dc2626',
  high:     '#ea580c',
  medium:   '#ca8a04',
  low:      '#16a34a',
}

export default function CalendarPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tasks, setTasks]       = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [today]                 = useState(new Date())
  const [current, setCurrent]   = useState(new Date())
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, projRes] = await Promise.all([
        api.get('/tasks/my'),
        api.get('/projects'),
      ])
      setTasks(tasksRes.data.tasks || [])
      setProjects(projRes.data.projects || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const totalTasks    = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const year          = current.getFullYear()
  const month         = current.getMonth()
  const firstDay      = new Date(year, month, 1).getDay()
  const daysInMonth   = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const getTasksForDate = (d) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr))
  }

  const selectedDateStr = selected
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
    : null
  const selectedTasks = selectedDateStr
    ? tasks.filter(t => t.due_date && t.due_date.startsWith(selectedDateStr))
    : []

  const cells = []
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevMonthDays - firstDay + 1 + i, current: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true })
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++)
    cells.push({ day: i, current: false })

  const upcomingTasks = tasks
    .filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 8)

  // FIX 1: single boolean reused for both sidebar and task links
  const canAccessProjects = user?.role === 'admin' || user?.role === 'manager'

  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks',  count: totalTasks },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  // FIX 1: Reports only visible to admin and manager
  const workspaceNav = [
    { to: '/teams', icon: 'ti-users', label: 'Teams' },
    ...(canAccessProjects
      ? [{ to: '/reports', icon: 'ti-chart-bar', label: 'Reports' }]
      : []),
    ...(user?.role === 'admin' ? [{ to: '/admin',    icon: 'ti-shield',   label: 'Admin Settings' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/settings', icon: 'ti-settings', label: 'Settings' }] : []),
  ]

  const TaskCardContent = ({ t }) => (
    <>
      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: PRIORITY_COLOR[t.priority] || '#9ca3af' }} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
          {t.title}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {t.due_date && new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {t.project_name && ` · ${t.project_name}`}
        </p>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ── */}
      <aside className="w-[240px] shrink-0 flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{ backgroundColor: '#1a2235' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #253047' }}>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Main</p>
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

          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Workspace</p>
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
        <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid #253047' }}>
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

      {/* ── Main (offset sidebar) ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Calendar</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-xl border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              style={{ borderColor: '#e8eaf0' }}>
              <i className="ti ti-chevron-left text-sm" />
            </button>
            <span className="text-[14px] font-semibold text-gray-800 min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-xl border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              style={{ borderColor: '#e8eaf0' }}>
              <i className="ti ti-chevron-right text-sm" />
            </button>
            <button
              onClick={() => { setCurrent(new Date()); setSelected(today.getDate()) }}
              className="px-3 py-1.5 text-[12px] font-semibold rounded-xl border transition hover:bg-gray-50"
              style={{ borderColor: '#e8eaf0', color: '#374151' }}>
              Today
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 flex gap-6">

          {/* Calendar grid */}
          <div className="flex-1 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #e8eaf0' }}>
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, minmax(100px, 1fr))' }}>
              {cells.map((cell, idx) => {
                const dayTasks   = cell.current ? getTasksForDate(cell.day) : []
                const isToday    = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSelected = cell.current && cell.day === selected
                return (
                  <div key={idx}
                    onClick={() => cell.current && setSelected(cell.day === selected ? null : cell.day)}
                    className="p-2 cursor-pointer transition"
                    style={{
                      border: '0.5px solid #f0f1f5',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      opacity: cell.current ? 1 : 0.35,
                    }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold mb-1 ${
                      isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}>
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate"
                          style={{
                            backgroundColor: (PRIORITY_COLOR[t.priority] || '#6b7280') + '18',
                            color: PRIORITY_COLOR[t.priority] || '#6b7280',
                            borderLeft: `2px solid ${PRIORITY_COLOR[t.priority] || '#9ca3af'}`,
                          }}>
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-gray-400 px-1">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Task list */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eaf0' }}>
              <p className="text-[13px] font-bold text-gray-800 mb-4">
                {selected ? `${MONTHS[month]} ${selected}` : 'Upcoming tasks'}
              </p>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (selected ? selectedTasks : upcomingTasks).length === 0 ? (
                <div className="text-center py-8">
                  <i className="ti ti-calendar-off text-3xl text-gray-200 block mb-2" />
                  <p className="text-xs text-gray-400">No tasks {selected ? 'this day' : 'upcoming'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* FIX 2: members see task info only, no link to project page */}
                  {(selected ? selectedTasks : upcomingTasks).map(t =>
                    canAccessProjects ? (
                      <Link key={t.id} to={`/projects/${t.project_id}`}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition group block">
                        <TaskCardContent t={t} />
                      </Link>
                    ) : (
                      <div key={t.id}
                        className="flex items-start gap-3 p-3 rounded-xl group">
                        <TaskCardContent t={t} />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Priority legend */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eaf0' }}>
              <p className="text-[13px] font-bold text-gray-800 mb-3">Priority legend</p>
              <div className="space-y-2">
                {Object.entries(PRIORITY_COLOR).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v }} />
                    <span className="text-[12px] text-gray-500 capitalize">{k}</span>
                    <span className="ml-auto text-[12px] font-semibold text-gray-700">
                      {tasks.filter(t => t.priority === k).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}