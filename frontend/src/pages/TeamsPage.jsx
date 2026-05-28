import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function TeamsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [teams, setTeams] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [newMemberId, setNewMemberId] = useState('')
  const [message, setMessage] = useState('')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetchTeams()
    api.get('/projects').then(res => setProjects(res.data.projects || [])).catch(console.error)
    if (user?.role === 'admin' || user?.role === 'manager') {
      api.get('/users').then(res => setAllUsers(res.data.users || [])).catch(console.error)
    }
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.teams || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchTeamDetail = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}`)
      setSelectedTeam(res.data.team)
    } catch (err) { console.error(err) }
  }

  const handleAddMember = async () => {
    if (!newMemberId) return
    try {
      await api.post(`/teams/${selectedTeam.id}/members`, {
        user_id: parseInt(newMemberId), role: 'member'
      })
      setMessage('success:Member added successfully!')
      setNewMemberId('')
      fetchTeamDetail(selectedTeam.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Failed to add member.'))
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return
    try {
      await api.delete(`/teams/${selectedTeam.id}/members/${userId}`)
      setMessage('success:Member removed.')
      fetchTeamDetail(selectedTeam.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('error:Failed to remove member.')
      setTimeout(() => setMessage(''), 3000)
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

  const msgIsSuccess = message.startsWith('success:')
  const msgText = message.replace(/^(success|error):/, '')

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
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="ti ti-users text-blue-600 text-[16px]" />
            </div>
            <span className="text-[15px] font-semibold text-gray-800">Teams</span>
            <span className="text-[12px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#f0f1f5', color: '#6b7a99' }}>
              {teams.length}
            </span>
          </div>
          {canManage && (
            <Link to="/teams/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition">
              <i className="ti ti-plus text-sm" /> New Team
            </Link>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-6 flex gap-6">

          {/* Toast message */}
          {message && (
            <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2 ${
              msgIsSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <i className={`ti ${msgIsSuccess ? 'ti-circle-check' : 'ti-alert-circle'} text-base`} />
              {msgText}
            </div>
          )}

          {/* Left — Teams list */}
          <div className="w-72 shrink-0 flex flex-col gap-3">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse" style={{ border: '1px solid #e8eaf0' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : teams.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #e8eaf0' }}>
                <i className="ti ti-users text-4xl text-gray-200 block mb-3" />
                <p className="text-sm font-semibold text-gray-500 mb-1">No teams yet</p>
                {canManage && (
                  <Link to="/teams/new"
                    className="mt-3 inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                    Create First Team
                  </Link>
                )}
              </div>
            ) : (
              teams.map(team => {
                const active = selectedTeam?.id === team.id
                return (
                  <button key={team.id} onClick={() => fetchTeamDetail(team.id)}
                    className="w-full text-left rounded-2xl p-4 transition"
                    style={{
                      border: active ? '1.5px solid #2563eb' : '1px solid #e8eaf0',
                      backgroundColor: active ? '#eff6ff' : '#ffffff',
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: active ? '#dbeafe' : '#f0f1f5', color: active ? '#1d4ed8' : '#6b7a99' }}>
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate"
                          style={{ color: active ? '#1e40af' : '#1f2937' }}>
                          {team.name}
                        </p>
                        <p className="text-[11px] mt-0.5 flex items-center gap-1"
                          style={{ color: active ? '#3b82f6' : '#9ca3af' }}>
                          <i className="ti ti-users text-[11px]" />
                          {team.member_count} {parseInt(team.member_count) === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                      {active && <i className="ti ti-chevron-right text-blue-500 text-sm" />}
                    </div>
                    {team.description && (
                      <p className="text-[11px] text-gray-400 mt-2.5 line-clamp-1 pl-[52px]">
                        {team.description}
                      </p>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Right — Team detail */}
          <div className="flex-1">
            {!selectedTeam ? (
              <div className="h-full min-h-[400px] bg-white rounded-2xl flex flex-col items-center justify-center"
                style={{ border: '1.5px dashed #e8eaf0' }}>
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4"
                  style={{ border: '1px solid #e8eaf0' }}>
                  <i className="ti ti-users text-3xl text-gray-300" />
                </div>
                <p className="text-[14px] font-semibold text-gray-400">Select a team to view details</p>
                <p className="text-[12px] text-gray-300 mt-1">Click any team on the left</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaf0' }}>

                {/* Team header */}
                <div className="px-7 py-6" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                        {selectedTeam.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-[20px] font-bold text-white">{selectedTeam.name}</h2>
                        <p className="text-blue-200 text-[13px] mt-0.5">
                          {selectedTeam.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl">
                      <i className="ti ti-users text-white text-[14px]" />
                      <span className="text-white text-[13px] font-semibold">
                        {selectedTeam.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add member */}
                {canManage && (
                  <div className="px-7 py-4" style={{ borderBottom: '1px solid #f0f1f5', backgroundColor: '#fafafa' }}>
                    <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Add Member</p>
                    <div className="flex gap-2">
                      <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-[13px] focus:outline-none focus:border-blue-500 transition"
                        style={{ border: '1.5px solid #e8eaf0', backgroundColor: '#fff' }}>
                        <option value="">Select a user to add...</option>
                        {allUsers
                          .filter(u => !selectedTeam.members?.find(m => m.id === u.id))
                          .map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                      </select>
                      <button onClick={handleAddMember} disabled={!newMemberId}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl disabled:opacity-40 transition flex items-center gap-1.5">
                        <i className="ti ti-user-plus text-sm" /> Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Members list */}
                <div className="px-7 py-5">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Team Members</p>
                  {selectedTeam.members?.length === 0 ? (
                    <div className="text-center py-10">
                      <i className="ti ti-user-off text-3xl text-gray-200 block mb-2" />
                      <p className="text-[13px] text-gray-400">No members in this team yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTeam.members?.map(member => (
                        <div key={member.id}
                          className="flex items-center justify-between p-3.5 rounded-xl transition group"
                          style={{ border: '1px solid #f0f1f5', backgroundColor: '#fafafa' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f7ff'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fafafa'}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800">{member.name}</p>
                              <p className="text-[11px] text-gray-400">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                              member.team_role === 'owner'   ? 'bg-amber-50 text-amber-700' :
                              member.team_role === 'manager' ? 'bg-purple-50 text-purple-700' :
                                                               'bg-blue-50 text-blue-700'
                            }`}>
                              {member.team_role}
                            </span>
                            {canManage && member.team_role !== 'owner' && (
                              <button onClick={() => handleRemoveMember(member.id)}
                                className="text-[11px] text-gray-400 hover:text-red-500 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                                <i className="ti ti-user-minus text-sm" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}