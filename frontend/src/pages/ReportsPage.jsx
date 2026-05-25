import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PRIORITY_INFO = [
  { key: 'critical', label: 'Critical', color: '#dc2626', bg: '#fef2f2' },
  { key: 'high',     label: 'High',     color: '#ea580c', bg: '#fff7ed' },
  { key: 'medium',   label: 'Medium',   color: '#ca8a04', bg: '#fefce8' },
  { key: 'low',      label: 'Low',      color: '#16a34a', bg: '#f0fdf4' },
]

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-semibold text-gray-600 w-8 text-right">{value}</span>
    </div>
  )
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
        ].map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition mb-0.5"
              style={{ backgroundColor: active ? '#2d3f5e' : 'transparent', color: active ? '#ffffff' : '#8b9ab8' }}>
              <i className={`ti ${item.icon} text-base`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid #253047' }}>
        <div onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
            <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); logout(); navigate('/login') }} style={{ color: '#6b7a99' }}>
            <i className="ti ti-logout text-sm" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [projects, setProjects] = useState([])
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks/my'),
      ])
      setProjects(projRes.data.projects || [])
      setTasks(tasksRes.data.tasks || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)

  const tasksByStatus = {
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review:      tasks.filter(t => t.status === 'review').length,
    done:        tasks.filter(t => t.status === 'done').length,
  }
  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high:     tasks.filter(t => t.priority === 'high').length,
    medium:   tasks.filter(t => t.priority === 'medium').length,
    low:      tasks.filter(t => t.priority === 'low').length,
  }
  const completionRate = tasks.length > 0 ? Math.round((tasksByStatus.done / tasks.length) * 100) : 0
  const overdueCount   = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
  const activeProjects = projects.filter(p => p.status === 'active').length

  const projectStats = projects.map(p => ({
    name:     p.name,
    status:   p.status,
    tasks:    parseInt(p.task_count) || 0,
    progress: p.status === 'completed' ? 100 : Math.min(Math.round(((parseInt(p.task_count) || 0) / 5) * 100), 95),
  }))

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} projects={projects.length} totalTasks={totalTasks}
        location={location} navigate={navigate} logout={logout} />

      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#f3f4f8' }}>
        <header className="h-14 bg-white flex items-center px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Reports</span>
        </header>

        <main className="flex-1 p-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Completion rate', value: `${completionRate}%`, icon: 'ti-trophy',         color: '#16a34a', bg: '#f0fdf4', sub: `${tasksByStatus.done} of ${tasks.length} tasks` },
              { label: 'Active projects', value: activeProjects,       icon: 'ti-rocket',          color: '#2563eb', bg: '#eff6ff', sub: `${projects.length} total` },
              { label: 'Overdue tasks',   value: overdueCount,         icon: 'ti-alert-triangle',  color: '#dc2626', bg: '#fef2f2', sub: 'Need attention' },
              { label: 'In review',       value: tasksByStatus.review, icon: 'ti-eye',             color: '#9333ea', bg: '#faf5ff', sub: 'Awaiting review' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ backgroundColor: c.bg, color: c.color }}>
                  <i className={`ti ${c.icon}`} />
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">{c.value}</div>
                <div className="text-[13px] text-gray-500">{c.label}</div>
                <div className="text-[11px] text-gray-400 mt-1">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tasks by status */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
              <h3 className="text-[14px] font-bold text-gray-800 mb-6">Tasks by status</h3>
              {loading ? (
                <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : (
                <>
                  <div className="space-y-5">
                    {[
                      { key: 'todo',        label: 'To Do',       color: '#94a3b8' },
                      { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
                      { key: 'review',      label: 'Review',      color: '#9333ea' },
                      { key: 'done',        label: 'Done',        color: '#22c55e' },
                    ].map(s => (
                      <div key={s.key}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[12px] font-medium text-gray-600">{s.label}</span>
                          <span className="text-[12px] text-gray-400">
                            {tasks.length > 0 ? Math.round((tasksByStatus[s.key] / tasks.length) * 100) : 0}%
                          </span>
                        </div>
                        <ProgressBar value={tasksByStatus[s.key]} max={tasks.length} color={s.color} />
                      </div>
                    ))}
                  </div>
                  {tasks.length > 0 && (
                    <div className="mt-6 pt-5 flex gap-3 flex-wrap" style={{ borderTop: '1px solid #f0f1f5' }}>
                      {[
                        { key: 'done',        label: 'Done',        color: '#22c55e' },
                        { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
                        { key: 'review',      label: 'Review',      color: '#9333ea' },
                        { key: 'todo',        label: 'To Do',       color: '#94a3b8' },
                      ].map(s => (
                        <div key={s.key} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-[11px] text-gray-400">{s.label} ({tasksByStatus[s.key]})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tasks by priority */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
              <h3 className="text-[14px] font-bold text-gray-800 mb-6">Tasks by priority</h3>
              {loading ? (
                <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {PRIORITY_INFO.map(p => (
                    <div key={p.key} className="rounded-xl p-4" style={{ backgroundColor: p.bg }}>
                      <div className="text-[28px] font-bold mb-1" style={{ color: p.color }}>{tasksByPriority[p.key]}</div>
                      <div className="text-[12px] font-semibold" style={{ color: p.color }}>{p.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: p.color, opacity: 0.7 }}>
                        {tasks.length > 0 ? Math.round((tasksByPriority[p.key] / tasks.length) * 100) : 0}% of tasks
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project breakdown */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
            <h3 className="text-[14px] font-bold text-gray-800 mb-6">Project breakdown</h3>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 text-gray-300">
                <i className="ti ti-chart-bar text-4xl block mb-2" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectStats.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] font-medium text-gray-700 truncate">{p.name}</span>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            p.status === 'active' ? 'bg-green-50 text-green-700' :
                            p.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'}`}>
                            {p.status}
                          </span>
                          <span className="text-[12px] font-bold text-gray-600">{p.progress}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${p.progress}%`, backgroundColor: p.status === 'completed' ? '#22c55e' : '#2563eb' }} />
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block">{p.tasks} {p.tasks === 1 ? 'task' : 'tasks'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}