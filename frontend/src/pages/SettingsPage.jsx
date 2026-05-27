import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function SettingsPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage]     = useState({ text: '', type: '' })
  const [loading, setLoading]     = useState(false)
  const [projects, setProjects]   = useState([])

  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects || [])
    } catch (err) { console.error(err) }
  }

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/users/${user.id}`, profileForm)
      login({ ...user, name: profileForm.name, email: profileForm.email },
        localStorage.getItem('token'))
      showMsg('Profile updated successfully!', 'success')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update profile.', 'error')
    } finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMsg('New passwords do not match.', 'error'); return
    }
    if (passwordForm.newPassword.length < 6) {
      showMsg('Password must be at least 6 characters.', 'error'); return
    }
    setLoading(true)
    try {
      await api.patch(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showMsg('Password changed successfully!', 'success')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to change password.', 'error')
    } finally { setLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const totalTasks = projects.reduce((s, p) => s + (parseInt(p.task_count) || 0), 0)

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
    ] : []),
    { to: '/settings', icon: 'ti-settings', label: 'Settings' },
  ]

  const settingsTabs = [
    { id: 'profile',  icon: 'ti-user',       label: 'Profile' },
    { id: 'password', icon: 'ti-lock',        label: 'Password' },
    { id: 'account',  icon: 'ti-info-circle', label: 'Account' },
  ]

  const strengthLevel = passwordForm.newPassword.length === 0 ? null
    : passwordForm.newPassword.length < 6  ? { label: 'Too weak', color: '#ef4444', width: '25%'  }
    : passwordForm.newPassword.length < 10 ? { label: 'Medium',   color: '#f59e0b', width: '60%'  }
    :                                        { label: 'Strong',    color: '#22c55e', width: '100%' }

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{ backgroundColor: '#1a2235' }}>

        <div className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid #253047' }}>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">T</div>
          <span className="text-[16px] font-semibold text-white">Task Hub</span>
        </div>

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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px]"
        style={{ backgroundColor: '#f3f4f8' }}>

        <header className="h-14 bg-white flex items-center justify-between px-7 sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e8eaf0' }}>
          <div className="flex items-center gap-2">
            <i className="ti ti-settings text-[18px] text-gray-500" />
            <span className="text-[15px] font-semibold text-gray-800">Settings</span>
          </div>
          <span className={`text-[11px] px-3 py-1 rounded-full font-semibold ${
            user?.role === 'admin'   ? 'bg-red-100 text-red-700' :
            user?.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                                       'bg-green-100 text-green-700'
          }`}>
            {user?.role}
          </span>
        </header>

        <main className="flex-1 p-8">

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

          <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-5"
            style={{ border: '1px solid #e8eaf0' }}>
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold mt-2 inline-block ${
                user?.role === 'admin'   ? 'bg-red-100 text-red-700' :
                user?.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                                           'bg-green-100 text-green-700'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-2" style={{ border: '1px solid #e8eaf0' }}>
                {settingsTabs.map(tab => {
                  const active = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition mb-0.5"
                      style={active
                        ? { backgroundColor: '#2563eb', color: '#fff' }
                        : { color: '#6b7280' }
                      }>
                      <i className={`ti ${tab.icon} text-[15px]`} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-3">

              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">Edit Profile</h3>
                  <p className="text-xs text-gray-400 mb-5">Update your name and email address</p>

                  {user?.role === 'admin' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-5 text-xs flex items-center gap-2">
                      <i className="ti ti-alert-triangle text-base" />
                      Admin account changes are logged for security.
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition"
                        style={{ border: '1.5px solid #e8eaf0' }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e8eaf0'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        placeholder="Your email"
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition"
                        style={{ border: '1.5px solid #e8eaf0' }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e8eaf0'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                    >
                      <i className="ti ti-device-floppy text-base" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">Change Password</h3>
                  <p className="text-xs text-gray-400 mb-5">Keep your account secure with a strong password</p>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {[
                      { label: 'Current Password',     key: 'currentPassword', placeholder: 'Enter current password' },
                      { label: 'New Password',         key: 'newPassword',     placeholder: 'Min 6 characters' },
                      { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                        <input
                          type="password"
                          value={passwordForm[f.key]}
                          onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                          required
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition"
                          style={{ border: '1.5px solid #e8eaf0' }}
                          onFocus={e => e.target.style.borderColor = '#2563eb'}
                          onBlur={e => e.target.style.borderColor = '#e8eaf0'}
                        />
                      </div>
                    ))}

                    {strengthLevel && (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-xs font-semibold text-gray-400">Password Strength</p>
                          <p className="text-xs font-semibold" style={{ color: strengthLevel.color }}>
                            {strengthLevel.label}
                          </p>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f5' }}>
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{ width: strengthLevel.width, backgroundColor: strengthLevel.color }} />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                    >
                      <i className="ti ti-lock text-base" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-5">

                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">Account Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name', value: user?.name,     icon: 'ti-user'   },
                        { label: 'Email',     value: user?.email,    icon: 'ti-mail'   },
                        { label: 'Role',      value: user?.role,     icon: 'ti-shield' },
                        { label: 'User ID',   value: '#' + user?.id, icon: 'ti-id'     },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl"
                          style={{ backgroundColor: '#f8f9fb' }}>
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <i className={`ti ${item.icon} text-blue-600 text-[15px]`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase">{item.label}</p>
                            <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e8eaf0' }}>
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">Your Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {[
                        { perm: 'View Projects & Tasks', allowed: true },
                        { perm: 'Create & Edit Tasks',   allowed: true },
                        { perm: 'Add Comments',          allowed: true },
                        { perm: 'Upload Attachments',    allowed: true },
                        { perm: 'Create Projects',       allowed: user?.role === 'admin' || user?.role === 'manager' },
                        { perm: 'Manage Teams',          allowed: user?.role === 'admin' || user?.role === 'manager' },
                        { perm: 'View Reports',          allowed: user?.role === 'admin' || user?.role === 'manager' },
                        { perm: 'Admin Dashboard',       allowed: user?.role === 'admin' },
                        { perm: 'Manage All Users',      allowed: user?.role === 'admin' },
                        { perm: 'Delete Projects',       allowed: user?.role === 'admin' || user?.role === 'manager' },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[12px] font-medium"
                          style={p.allowed
                            ? { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { backgroundColor: '#f8f9fb', color: '#9ca3af', border: '1px solid #f0f1f5' }
                          }>
                          <i className={`ti ${p.allowed ? 'ti-circle-check' : 'ti-lock'} text-[14px]`} />
                          {p.perm}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6"
                    style={{ border: '1px solid #fecaca' }}>
                    <h3 className="text-[15px] font-bold text-red-600 mb-1">Danger Zone</h3>
                    <p className="text-xs text-gray-400 mb-4">These actions are irreversible</p>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca' }}>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Sign out of your account</p>
                        <p className="text-xs text-gray-400 mt-0.5">You will be redirected to the login page</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                      >
                        <i className="ti ti-logout text-base" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}