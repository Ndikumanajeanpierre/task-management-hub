import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  on_hold:   'bg-amber-50 text-amber-700',
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

export default function ProjectsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('name')
  const [view, setView]         = useState('grid')

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const totalTasks     = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const activeCount    = projects.filter(p => p.status === 'active').length
  const completedCount = projects.filter(p => p.status === 'completed').length

  const filtered = projects
    .filter(p => {
      if (filter !== 'all' && p.status !== filter) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !(p.description || '').toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name')   return a.name.localeCompare(b.name)
      if (sortBy === 'tasks')  return (parseInt(b.task_count) || 0) - (parseInt(a.task_count) || 0)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} projects={projects.length} totalTasks={totalTasks}
        location={location} navigate={navigate} logout={logout} />

      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#f3f4f8' }}>
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <span className="text-[15px] font-semibold text-gray-800">Projects</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" placeholder="Search projects..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-[13px] rounded-xl border focus:outline-none focus:border-blue-400 transition"
                style={{ borderColor: '#e8eaf0', width: 200 }} />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 text-[13px] rounded-xl border focus:outline-none transition"
              style={{ borderColor: '#e8eaf0' }}>
              <option value="name">Sort: Name</option>
              <option value="tasks">Sort: Tasks</option>
              <option value="status">Sort: Status</option>
            </select>
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#f3f4f8', border: '1px solid #e8eaf0' }}>
              {[{ key: 'grid', icon: 'ti-layout-grid' }, { key: 'list', icon: 'ti-list' }].map(v => (
                <button key={v.key} onClick={() => setView(v.key)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition text-sm"
                  style={view === v.key
                    ? { backgroundColor: '#fff', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
                    : { color: '#9ca3af' }}>
                  <i className={`ti ${v.icon}`} />
                </button>
              ))}
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition">
                <i className="ti ti-plus text-sm" /> New project
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total',     value: projects.length, color: '#2563eb', bg: '#eff6ff', icon: 'ti-folder' },
              { label: 'Active',    value: activeCount,     color: '#16a34a', bg: '#f0fdf4', icon: 'ti-rocket' },
              { label: 'Completed', value: completedCount,  color: '#7c3aed', bg: '#faf5ff', icon: 'ti-circle-check' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ border: '1px solid #e8eaf0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: c.bg, color: c.color }}>
                  <i className={`ti ${c.icon}`} />
                </div>
                <div>
                  <div className="text-[28px] font-bold text-gray-900 leading-none">{c.value}</div>
                  <div className="text-[12px] text-gray-400">{c.label} projects</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 items-center">
            {['all', 'active', 'completed', 'on_hold'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition border"
                style={filter === f
                  ? { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                  : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e8eaf0' }}>
                {f === 'on_hold' ? 'On hold' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="ml-auto text-[12px] text-gray-400">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Projects */}
          {loading ? (
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
                  <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed" style={{ borderColor: '#d1d5db' }}>
              <i className="ti ti-folder-open text-5xl text-gray-200 block mb-3" />
              <p className="text-sm font-semibold text-gray-400">No projects found</p>
              <p className="text-xs text-gray-300 mt-1 mb-5">Try a different filter or search term</p>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Link to="/projects/new"
                  className="bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition">
                  Create project
                </Link>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(project => {
                const taskCount = parseInt(project.task_count) || 0
                const progress  = project.status === 'completed' ? 100 : Math.min(Math.round((taskCount / 5) * 100), 95)
                const barColor  = project.status === 'completed' ? '#22c55e' : '#2563eb'
                return (
                  <Link key={project.id} to={`/projects/${project.id}`}
                    className="bg-white rounded-2xl p-6 transition-all duration-150 group block hover:shadow-md"
                    style={{ border: '1px solid #e8eaf0' }}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {project.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLE[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition">{project.name}</p>
                    <p className="text-xs text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] text-gray-400 font-medium">Progress</span>
                        <span className="text-[12px] font-bold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid #f5f6fa' }}>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <i className="ti ti-users text-[13px]" />{project.team_name || 'No team'}
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
          ) : (
            <div className="space-y-2">
              {filtered.map(project => {
                const taskCount = parseInt(project.task_count) || 0
                const progress  = project.status === 'completed' ? 100 : Math.min(Math.round((taskCount / 5) * 100), 95)
                return (
                  <Link key={project.id} to={`/projects/${project.id}`}
                    className="bg-white rounded-2xl px-6 py-4 flex items-center gap-5 group hover:shadow-sm transition"
                    style={{ border: '1px solid #e8eaf0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                      {project.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-600 transition truncate">{project.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{project.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="w-32">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-gray-400">Progress</span>
                          <span className="text-[10px] font-bold text-gray-600">{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${progress}%`, backgroundColor: project.status === 'completed' ? '#22c55e' : '#2563eb' }} />
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 w-16 text-center">{project.task_count} tasks</span>
                      <span className="text-[11px] text-gray-400 w-24 truncate text-center">{project.team_name || 'No team'}</span>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold w-20 text-center ${STATUS_STYLE[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
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