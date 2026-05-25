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

function Sidebar({ user, projects, totalTasks, location, navigate, logout }) {
  return (
    <aside className="w-[260px] shrink-0 flex flex-col" style={{ backgroundColor: '#1a2235' }}>
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold">T</div>
        <span className="text-[16px] font-semibold text-white">Task Hub</span>
      </div>
      <div className="flex-1 px-3 py-2">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Main</p>
        {[
          { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects },
          { to: '/projects',  icon: 'ti-folder',           label: 'Projects',  count: projects },
          { to: '/tasks',     icon: 'ti-checklist',         label: 'My Tasks',  count: totalTasks },
          { to: '/calendar',  icon: 'ti-calendar',          label: 'Calendar' },
        ].map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
              style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#ffffff' : '#8b9ab8' }}>
              <i className={`ti ${item.icon} text-base`} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: active ? '#3d5280' : '#253047', color: active ? '#93c5fd' : '#6b7a99' }}>
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
        <p className="px-3 py-2 mt-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>Workspace</p>
        {[
          { to: '/teams',   icon: 'ti-users',    label: 'Teams' },
          { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
          ...(user?.role === 'admin' ? [{ to: '/admin', icon: 'ti-settings', label: 'Settings' }] : []),
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
            style={{ color: '#8b9ab8' }}>
            <i className={`ti ${item.icon} text-base`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid #253047' }}>
        <div onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
            <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); logout(); navigate('/login') }}
            style={{ color: '#6b7a99' }}>
            <i className="ti ti-logout text-sm" />
          </button>
        </div>
      </div>
    </aside>
  )
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

  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)

  const year  = current.getFullYear()
  const month = current.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
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

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} projects={projects.length} totalTasks={totalTasks}
        location={location} navigate={navigate} logout={logout} />

      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#f3f4f8' }}>
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

        <main className="flex-1 p-6 flex gap-6">
          {/* Calendar grid */}
          <div className="flex-1 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #e8eaf0' }}>
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, minmax(100px, 1fr))' }}>
              {cells.map((cell, idx) => {
                const dayTasks = cell.current ? getTasksForDate(cell.day) : []
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
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
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

          {/* Side panel */}
          <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eaf0' }}>
              <p className="text-[13px] font-bold text-gray-800 mb-4">
                {selected ? `${MONTHS[month]} ${selected}` : 'Upcoming tasks'}
              </p>
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : (selected ? selectedTasks : upcomingTasks).length === 0 ? (
                <div className="text-center py-8">
                  <i className="ti ti-calendar-off text-3xl text-gray-200 block mb-2" />
                  <p className="text-xs text-gray-400">No tasks {selected ? 'this day' : 'upcoming'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(selected ? selectedTasks : upcomingTasks).map(t => (
                    <Link key={t.id} to={`/projects/${t.project_id}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition group block">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: PRIORITY_COLOR[t.priority] || '#9ca3af' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">{t.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {t.due_date && new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {t.project_name && ` · ${t.project_name}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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