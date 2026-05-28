import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function CreateTeamPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.projects || [])).catch(console.error)
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('Team name is required.'); return }
    setLoading(true)
    try {
      await api.post('/teams', form)
      navigate('/teams')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)
  const canManage = user?.role === 'admin' || user?.role === 'manager'

  const mainNav = [
    { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', count: projects.length },
    { to: '/projects',  icon: 'ti-folder',            label: 'Projects',  count: projects.length },
    { to: '/tasks',     icon: 'ti-checklist',          label: 'My Tasks',  count: totalTasks },
    { to: '/calendar',  icon: 'ti-calendar',           label: 'Calendar' },
  ]

  const workspaceNav = [
    { to: '/teams', icon: 'ti-users', label: 'Teams' },
    ...(canManage ? [{ to: '/reports', icon: 'ti-chart-bar', label: 'Reports' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin',    icon: 'ti-shield',   label: 'Admin Settings' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/settings', icon: 'ti-settings', label: 'Settings' }] : []),
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

        <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid #253047' }}>
          <div onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] capitalize" style={{ color: '#6b7a99' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition"
            style={{ color: '#8b9ab8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b9ab8' }}>
            <i className="ti ti-logout text-[16px]" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]" style={{ backgroundColor: '#f3f4f8' }}>

        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/teams')}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-gray-600 transition">
              <i className="ti ti-arrow-left text-sm" /> Back to Teams
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 flex items-start justify-center">
          <div className="w-full max-w-xl">

            {/* Page heading */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
                <i className="ti ti-users text-white text-[22px]" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900">Create New Team</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">Set up a team to collaborate on projects</p>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e8eaf0' }}>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                  <i className="ti ti-alert-circle text-base" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Team Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl text-[13px] focus:outline-none transition"
                    style={{ border: '1.5px solid #e8eaf0' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e8eaf0'}
                    placeholder="e.g. Development Team"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-[13px] focus:outline-none transition resize-none"
                    style={{ border: '1.5px solid #e8eaf0' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e8eaf0'}
                    placeholder="What does this team work on?"
                  />
                </div>

                {/* Preview card */}
                {form.name && (
                  <div className="rounded-xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: '#f5f7ff', border: '1px solid #e0e7ff' }}>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {form.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{form.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {form.description || 'No description provided'}
                      </p>
                    </div>
                    <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      Preview
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => navigate('/teams')}
                    className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
                    style={{ border: '1.5px solid #e8eaf0' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {loading
                      ? <><i className="ti ti-loader-2 animate-spin text-sm" /> Creating...</>
                      : <><i className="ti ti-users text-sm" /> Create Team</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}