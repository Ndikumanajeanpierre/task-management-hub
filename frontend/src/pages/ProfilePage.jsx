import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value })

  const showMessage = (msg, isError = false) => {
    if (isError) setError(msg)
    else setMessage(msg)
    setTimeout(() => { setMessage(''); setError('') }, 4000)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/users/${user.id}`, form)
      login({ ...user, name: form.name, email: form.email },
        localStorage.getItem('token'))
      showMessage('✅ Profile updated successfully!')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update profile.', true)
    } finally {
      setLoading(false)
    }
  }

  const roleColor = {
    admin: 'from-red-400 to-red-600',
    manager: 'from-purple-400 to-purple-600',
    member: 'from-blue-400 to-blue-600',
  }

  const roleLabel = {
    admin: '⚙️ Administrator',
    manager: '📋 Project Manager',
    member: '👤 Team Member',
  }

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
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-bold text-gray-800">My Profile</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Profile Header Card */}
        <div className={`bg-gradient-to-br ${roleColor[user?.role]} rounded-3xl p-8 text-white mb-8 shadow-xl`}>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center shadow-lg border-4 border-white border-opacity-30">
              <span className="text-5xl font-extrabold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{user?.name}</h1>
              <p className="text-white text-opacity-80 mt-1">{user?.email}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-white bg-opacity-20 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {roleLabel[user?.role]}
                </span>
                <span className="bg-white bg-opacity-20 px-4 py-1.5 rounded-full text-sm font-semibold">
                  ID: #{user?.id}
                </span>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {[
            { id: 'profile', label: '👤 Edit Profile' },
            { id: 'info', label: '📊 Account Info' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Edit Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="Your email"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
                >
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', value: user?.name, icon: '👤' },
                { label: 'Email Address', value: user?.email, icon: '📧' },
                { label: 'Account Role', value: roleLabel[user?.role], icon: '🔑' },
                { label: 'User ID', value: `#${user?.id}`, icon: '🆔' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl border border-gray-100">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Permissions */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Your Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { perm: 'View Projects', allowed: true },
                  { perm: 'Create Tasks', allowed: true },
                  { perm: 'Comment on Tasks', allowed: true },
                  { perm: 'Create Projects', allowed: user?.role === 'admin' || user?.role === 'manager' },
                  { perm: 'Manage Teams', allowed: user?.role === 'admin' || user?.role === 'manager' },
                  { perm: 'Admin Dashboard', allowed: user?.role === 'admin' },
                  { perm: 'Manage Users', allowed: user?.role === 'admin' },
                  { perm: 'Delete Projects', allowed: user?.role === 'admin' || user?.role === 'manager' },
                  { perm: 'View Reports', allowed: user?.role === 'admin' },
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
          </div>
        )}
      </div>
    </div>
  )
}