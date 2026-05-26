import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function SettingsPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg)
    else setMessage(msg)
    setTimeout(() => { setMessage(''); setError('') }, 4000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/users/${user.id}`, profileForm)
      login({ ...user, name: profileForm.name, email: profileForm.email },
        localStorage.getItem('token'))
      showMsg('✅ Profile updated successfully!')
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed to update profile.'), true)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMsg('❌ New passwords do not match.', true)
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showMsg('❌ Password must be at least 6 characters.', true)
      return
    }
    setLoading(true)
    try {
      await api.patch(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showMsg('✅ Password changed successfully!')
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed to change password.'), true)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColor = {
    admin: 'from-red-500 to-pink-600',
    manager: 'from-purple-500 to-purple-600',
    member: 'from-blue-500 to-indigo-600',
  }

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'password', label: '🔒 Password', icon: '🔒' },
    { id: 'account', label: '⚙️ Account', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
              >
                ← Dashboard
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm">⚙️</span>
              </div>
              <span className="font-bold text-gray-800">Settings</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-sm px-4 py-2 rounded-xl transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Profile Header */}
        <div className={`bg-gradient-to-br ${roleColor[user?.role]} rounded-3xl p-6 text-white mb-8 shadow-xl`}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center border-4 border-white border-opacity-30 shadow-lg">
              <span className="text-4xl font-extrabold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{user?.name}</h1>
              <p className="text-white text-opacity-80 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {user?.role === 'admin' ? '⚙️ Administrator' :
                   user?.role === 'manager' ? '📋 Project Manager' : '👤 Team Member'}
                </span>
                {user?.role === 'admin' && (
                  <span className="bg-yellow-400 bg-opacity-30 text-yellow-100 text-xs px-3 py-1 rounded-full font-semibold">
                    🔒 Protected Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label.split(' ').slice(1).join(' ')}
                </button>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Edit Profile</h2>
                <p className="text-sm text-gray-400 mb-6">Update your name and email address</p>

                {/* Admin warning */}
                {user?.role === 'admin' && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Admin account settings are protected. Changes are logged for security.</span>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      placeholder="Your email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg shadow-blue-200 text-sm"
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Change Password</h2>
                <p className="text-sm text-gray-400 mb-6">Keep your account secure with a strong password</p>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password strength indicator */}
                  {passwordForm.newPassword && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Password Strength</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordForm.newPassword.length < 6 ? 'bg-red-400 w-1/4' :
                            passwordForm.newPassword.length < 10 ? 'bg-amber-400 w-2/4' :
                            'bg-green-500 w-full'
                          }`}
                        ></div>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${
                        passwordForm.newPassword.length < 6 ? 'text-red-400' :
                        passwordForm.newPassword.length < 10 ? 'text-amber-500' :
                        'text-green-500'
                      }`}>
                        {passwordForm.newPassword.length < 6 ? 'Too weak' :
                         passwordForm.newPassword.length < 10 ? 'Medium' : 'Strong ✓'}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg shadow-blue-200 text-sm"
                  >
                    {loading ? '⏳ Changing...' : '🔒 Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-5">

                {/* Account Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Account Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: user?.name, icon: '👤' },
                      { label: 'Email', value: user?.email, icon: '📧' },
                      { label: 'Role', value: user?.role, icon: '🔑' },
                      { label: 'User ID', value: '#' + user?.id, icon: '🆔' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase">{item.label}</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Your Permissions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { perm: 'View Projects & Tasks', allowed: true },
                      { perm: 'Create & Edit Tasks', allowed: true },
                      { perm: 'Add Comments', allowed: true },
                      { perm: 'Upload Attachments', allowed: true },
                      { perm: 'Create Projects', allowed: user?.role === 'admin' || user?.role === 'manager' },
                      { perm: 'Manage Teams', allowed: user?.role === 'admin' || user?.role === 'manager' },
                      { perm: 'Admin Dashboard', allowed: user?.role === 'admin' },
                      { perm: 'Manage All Users', allowed: user?.role === 'admin' },
                      { perm: 'Delete Projects', allowed: user?.role === 'admin' || user?.role === 'manager' },
                      { perm: 'View System Reports', allowed: user?.role === 'admin' },
                    ].map((p, i) => (
                      <div key={i} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                        p.allowed
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}>
                        <span>{p.allowed ? '✅' : '🔒'}</span>
                        {p.perm}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-sm text-gray-400 mb-4">These actions are irreversible</p>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Sign out of your account</p>
                      <p className="text-xs text-gray-400 mt-0.5">You will be redirected to the login page</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-red-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}