import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function TeamsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [newMemberId, setNewMemberId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTeams()
    if (user?.role === 'admin' || user?.role === 'manager') {
      api.get('/users').then(res => setAllUsers(res.data.users)).catch(console.error)
    }
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.teams)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamDetail = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}`)
      setSelectedTeam(res.data.team)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberId) return
    try {
      await api.post(`/teams/${selectedTeam.id}/members`, {
        user_id: parseInt(newMemberId),
        role: 'member'
      })
      setMessage('✅ Member added successfully!')
      setNewMemberId('')
      fetchTeamDetail(selectedTeam.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to add member.'))
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return
    try {
      await api.delete(`/teams/${selectedTeam.id}/members/${userId}`)
      setMessage('✅ Member removed.')
      fetchTeamDetail(selectedTeam.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Failed to remove member.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
            >
              ← Dashboard
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm">👥</span>
            </div>
            <span className="font-bold text-gray-800">Teams</span>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link
              to="/teams/new"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-md shadow-green-200"
            >
              + New Team
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              All Teams
              <span className="ml-2 text-sm font-normal text-gray-400">({teams.length})</span>
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-400 font-medium">No teams yet</p>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Link
                    to="/teams/new"
                    className="mt-4 inline-block bg-green-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-600 transition font-semibold"
                  >
                    Create First Team
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => fetchTeamDetail(team.id)}
                    className={`w-full text-left bg-white rounded-2xl p-5 border-2 transition hover:shadow-md ${
                      selectedTeam?.id === team.id
                        ? 'border-green-500 shadow-md'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{team.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          👥 {team.member_count} members
                        </p>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-xs text-gray-400 mt-3 line-clamp-2">{team.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Team Detail */}
          <div className="lg:col-span-2">
            {!selectedTeam ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <p className="text-4xl mb-3">👈</p>
                  <p className="text-gray-400 font-medium">Select a team to view details</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Team Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <h3 className="text-2xl font-extrabold">{selectedTeam.name}</h3>
                  <p className="text-green-100 text-sm mt-1">
                    {selectedTeam.description || 'No description'}
                  </p>
                  <p className="text-green-200 text-xs mt-3">
                    👥 {selectedTeam.members?.length || 0} members
                  </p>
                </div>

                {/* Add Member */}
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <div className="p-5 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-bold text-gray-700 mb-3">Add Member</p>
                    <div className="flex gap-2">
                      <select
                        value={newMemberId}
                        onChange={e => setNewMemberId(e.target.value)}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition"
                      >
                        <option value="">Select a user to add...</option>
                        {allUsers
                          .filter(u => !selectedTeam.members?.find(m => m.id === u.id))
                          .map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))
                        }
                      </select>
                      <button
                        onClick={handleAddMember}
                        disabled={!newMemberId}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="p-5">
                  <p className="text-sm font-bold text-gray-700 mb-4">Team Members</p>
                  {selectedTeam.members?.length === 0 ? (
                    <p className="text-gray-300 text-sm text-center py-8">No members yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedTeam.members?.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              member.team_role === 'owner'
                                ? 'bg-yellow-100 text-yellow-700'
                                : member.team_role === 'manager'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {member.team_role}
                            </span>
                            {(user?.role === 'admin' || user?.role === 'manager') &&
                              member.team_role !== 'owner' && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-xs text-red-400 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                              >
                                Remove
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
        </div>
      </div>
    </div>
  )
}