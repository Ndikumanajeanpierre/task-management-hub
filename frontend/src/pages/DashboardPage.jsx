import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchNotifications()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/tasks/notifications')
      setNotifications(res.data.notifications)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const unread = notifications.filter(n => !n.is_read).length

  const roleColor = {
    admin: 'bg-red-100 text-red-700 border border-red-200',
    manager: 'bg-purple-100 text-purple-700 border border-purple-200',
    member: 'bg-green-100 text-green-700 border border-green-200',
  }

  const statusColor = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-amber-100 text-amber-700',
  }

  const statCards = [
    { label: 'Total Projects', value: projects.length, color: 'from-blue-500 to-blue-600', icon: '📁' },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, color: 'from-emerald-500 to-emerald-600', icon: '🚀' },
    { label: 'Total Tasks', value: projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0), color: 'from-violet-500 to-violet-600', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-extrabold text-gray-800 text-lg tracking-tight">Task Hub</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                >
                  <span className="text-lg">🔔</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                      <span className="text-xs text-gray-400">{unread} unread</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-300 text-sm">No notifications</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50' : ''}`}>
                            <p className="text-sm text-gray-700">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColor[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
{user?.role === 'admin' && (
  <Link
    to="/admin"
    className="text-sm bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-3 py-1.5 rounded-lg transition"
  >
    ⚙️ Admin
  </Link>
)}  
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 font-medium transition px-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Good day, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your projects</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">{card.label}</p>
                  <p className="text-4xl font-extrabold mt-1">{card.value}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Your Projects</h2>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link
              to="/projects/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-200"
            >
              <span>+</span> New Project
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-gray-500 font-semibold text-lg">No projects yet</p>
            <p className="text-gray-300 text-sm mt-1 mb-6">Create your first project to get started</p>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link
                to="/projects/new"
                className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                + Create First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[project.status] || 'bg-gray-100 text-gray-600'}`}>
                    {project.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>👥</span>
                    <span>{project.team_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>📋</span>
                    <span>{project.task_count} tasks</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}