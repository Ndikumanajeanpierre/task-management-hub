import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    accent: '#7c3aed',
    accentLight: '#ede9fe',
    accentText: '#5b21b6',
    heroBg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #1e1b4b 100%)',
  },
  manager: {
    label: 'Project Manager',
    accent: '#0f766e',
    accentLight: '#ccfbf1',
    accentText: '#065f46',
    heroBg: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #042f2e 100%)',
  },
  member: {
    label: 'Team Member',
    accent: '#1d4ed8',
    accentLight: '#dbeafe',
    accentText: '#1e3a8a',
    heroBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
  },
}

const PERMISSIONS = [
  { perm: 'View Projects',    roles: ['admin', 'manager', 'member'] },
  { perm: 'Create Tasks',     roles: ['admin', 'manager', 'member'] },
  { perm: 'Comment on Tasks', roles: ['admin', 'manager', 'member'] },
  { perm: 'Create Projects',  roles: ['admin', 'manager'] },
  { perm: 'Manage Teams',     roles: ['admin', 'manager'] },
  { perm: 'Delete Projects',  roles: ['admin', 'manager'] },
  { perm: 'View Reports',     roles: ['admin'] },
  { perm: 'Manage Users',     roles: ['admin'] },
  { perm: 'Admin Dashboard',  roles: ['admin'] },
]

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const IcoUser   = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
const IcoMail   = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />
const IcoKey    = () => <Icon d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
const IcoBadge  = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
const IcoShield = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
const IcoLock   = () => <Icon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />
const IcoCheck  = () => <Icon d="M20 6L9 17l-5-5" />
const IcoArrow  = () => <Icon d="M19 12H5M12 19l-7-7 7-7" />
const IcoUpload = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
const IcoCamera = () => <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />

const Field = ({ label, children }) => (
  <div>
    <label style={{
      display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#6b7280', marginBottom: 8,
    }}>{label}</label>
    {children}
  </div>
)

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 14, fontFamily: 'inherit', color: '#111827',
  background: '#f9fafb', outline: 'none',
  transition: 'border 0.15s, background 0.15s',
  boxSizing: 'border-box',
}

// ── Helper: build full avatar URL from stored path ────────────────────────────
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar
  return `http://localhost:5000${avatar}`
}

export default function ProfilePage() {
  const { user, login } = useAuth()
  const navigate        = useNavigate()
  const cfg             = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.member

  const [form, setForm]             = useState({ name: user?.name || '', email: user?.email || '' })
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState('')
  const [error, setError]           = useState('')
  const [activeTab, setActiveTab]   = useState('profile')
  const [focusField, setFocusField] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // ── Load avatar from saved user on first render ───────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(
    getAvatarUrl(user?.avatar)
  )

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const showMessage = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg)
    setTimeout(() => { setMessage(''); setError('') }, 4000)
  }

  const handleUpdateProfile = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/users/${user.id}`, form)
      login({ ...user, name: form.name, email: form.email }, localStorage.getItem('token'))
      showMessage('Profile updated successfully')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update profile.', true)
    } finally { setLoading(false) }
  }

  // ── Avatar upload: preview instantly, save to server, persist in context ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Instant local preview while uploading
    setAvatarPreview(URL.createObjectURL(file))

    try {
      setAvatarUploading(true)
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Save avatar URL into context + localStorage so it survives navigation
      const updatedUser = { ...user, avatar: res.data.avatar }
      login(updatedUser, localStorage.getItem('token'))

      // Switch preview from blob URL to real server URL
      setAvatarPreview(getAvatarUrl(res.data.avatar))

      showMessage('Photo updated successfully')
    } catch {
      showMessage('Failed to save photo to server.', true)
    } finally {
      setAvatarUploading(false)
    }
  }

  const initials = (user?.name || 'U').charAt(0).toUpperCase()

  const s = {
    page: {
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    nav: {
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: 12,
      height: 56, position: 'sticky', top: 0, zIndex: 40,
    },
    backBtn: {
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 13, color: '#6b7280', fontWeight: 500,
      cursor: 'pointer', background: 'none', border: 'none',
      fontFamily: 'inherit', padding: 0,
    },
    divider: { width: 1, height: 18, background: '#e5e7eb' },
    navTitle: { fontSize: 14, fontWeight: 600, color: '#111827' },
    body: { maxWidth: 900, margin: '0 auto', padding: '28px 24px 48px' },
    hero: {
      background: cfg.heroBg,
      borderRadius: 20,
      padding: '32px 36px',
      display: 'flex', alignItems: 'center', gap: 24,
      position: 'relative', overflow: 'hidden',
      marginBottom: 20,
    },
    heroOrb1: {
      position: 'absolute', top: -50, right: -50,
      width: 200, height: 200, borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
    },
    heroOrb2: {
      position: 'absolute', bottom: -30, left: 200,
      width: 130, height: 130, borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
    },
    avatarWrapper: {
      position: 'relative', flexShrink: 0,
      width: 76, height: 76, cursor: 'pointer',
    },
    avatarRing: {
      width: 76, height: 76, borderRadius: 18,
      background: 'rgba(255,255,255,0.13)',
      border: '2px solid rgba(255,255,255,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 30, fontWeight: 700, color: '#fff',
      overflow: 'hidden',
    },
    avatarOverlay: {
      position: 'absolute', inset: 0, borderRadius: 18,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', opacity: 0, transition: 'opacity 0.2s',
    },
    heroName: {
      fontFamily: "'DM Serif Display', Georgia, serif",
      fontSize: 26, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px',
    },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 14px' },
    badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: 'rgba(255,255,255,0.13)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
    },
    uploadBtn: {
      marginLeft: 'auto', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '9px 16px', border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: 10, background: 'rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit',
    },
    statsRow: {
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12, marginBottom: 20,
    },
    statCard: {
      background: '#fff', borderRadius: 14,
      border: '1px solid #e5e7eb', padding: '16px 18px',
    },
    statLabel: {
      fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6,
    },
    statValue: { fontSize: 18, fontWeight: 700, color: '#111827' },
    statSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    toast: (isErr) => ({
      padding: '11px 16px', borderRadius: 10, marginBottom: 16,
      fontSize: 13, fontWeight: 500,
      background: isErr ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${isErr ? '#fecaca' : '#bbf7d0'}`,
      color: isErr ? '#dc2626' : '#15803d',
      display: 'flex', alignItems: 'center', gap: 8,
    }),
    tabBar: {
      display: 'flex', gap: 4, marginBottom: 20,
      background: '#fff', borderRadius: 12, padding: 4,
      border: '1px solid #e5e7eb', width: 'fit-content',
    },
    tab: (active) => ({
      padding: '8px 20px', borderRadius: 8, border: 'none',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.15s',
      background: active ? cfg.accent : 'transparent',
      color: active ? '#fff' : '#6b7280',
    }),
    panel: {
      background: '#fff', borderRadius: 16,
      border: '1px solid #e5e7eb', overflow: 'hidden',
    },
    panelHead: {
      padding: '18px 24px 16px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    panelTitle: { fontSize: 15, fontWeight: 700, color: '#111827' },
    panelBody: { padding: '24px' },
    saveBtn: (disabled) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '11px 22px', background: disabled ? '#d1d5db' : cfg.accent,
      color: '#fff', border: 'none', borderRadius: 10,
      fontSize: 14, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit', transition: 'opacity 0.15s',
      opacity: disabled ? 0.7 : 1,
    }),
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
    infoItem: {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', background: '#f9fafb',
      borderRadius: 12, border: '1px solid #f3f4f6',
    },
    infoIcon: {
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: cfg.accentLight, color: cfg.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    infoKey: {
      fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: '#9ca3af',
    },
    infoVal: { fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2 },
    permGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 },
    permItem: (granted) => ({
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px', borderRadius: 9,
      fontSize: 12, fontWeight: 500,
      background: granted ? cfg.accentLight : '#f9fafb',
      color: granted ? cfg.accentText : '#9ca3af',
      border: `1px solid ${granted ? cfg.accentLight : '#f3f4f6'}`,
    }),
  }

  return (
    <div style={s.page}>

      {/* Hidden file input */}
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />

      {/* Nav */}
      <nav style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>
          <IcoArrow /> Dashboard
        </button>
        <div style={s.divider} />
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: cfg.heroBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          overflow: 'hidden',
        }}>
          {avatarPreview
            ? <img src={avatarPreview} alt="nav-avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <span style={s.navTitle}>My Profile</span>
      </nav>

      <div style={s.body}>

        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroOrb1} />
          <div style={s.heroOrb2} />

          {/* Clickable avatar */}
          <div
            style={s.avatarWrapper}
            onClick={() => document.getElementById('avatar-upload').click()}
            onMouseEnter={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = 1}
            onMouseLeave={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = 0}
          >
            <div style={s.avatarRing}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div className="avatar-overlay" style={s.avatarOverlay}>
              {avatarUploading
                ? <span style={{ fontSize: 11, fontWeight: 600 }}>...</span>
                : <IcoCamera />}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={s.heroName}>{user?.name}</h1>
            <p style={s.heroEmail}>{user?.email}</p>
            <div style={s.badges}>
              <span style={s.badge}><IcoShield /> {cfg.label}</span>
              <span style={s.badge}><IcoBadge /> ID #{user?.id}</span>
            </div>
          </div>

          <button
            style={s.uploadBtn}
            onClick={() => document.getElementById('avatar-upload').click()}
          >
            {avatarUploading
              ? <><IcoUpload /> Uploading…</>
              : <><IcoUpload /> Upload photo</>}
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: 'Member Since', value: '2024',     sub: 'Active account' },
            { label: 'Role',         value: cfg.label,  sub: 'Current access level' },
            { label: 'Status',       value: '● Active', sub: 'Verified email', color: '#16a34a' },
          ].map((c, i) => (
            <div key={i} style={s.statCard}>
              <div style={s.statLabel}>{c.label}</div>
              <div style={{ ...s.statValue, color: c.color || '#111827' }}>{c.value}</div>
              <div style={s.statSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Toasts */}
        {message && <div style={s.toast(false)}><IcoCheck /> {message}</div>}
        {error   && <div style={s.toast(true)}><IcoLock /> {error}</div>}

        {/* Tabs */}
        <div style={s.tabBar}>
          {[
            { id: 'profile', label: 'Edit Profile', Icon: IcoUser  },
            { id: 'info',    label: 'Account Info', Icon: IcoBadge },
          ].map(t => (
            <button key={t.id} style={s.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <t.Icon /> {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Edit Profile Tab */}
        {activeTab === 'profile' && (
          <div style={s.panel}>
            <div style={s.panelHead}>
              <span style={{ color: cfg.accent }}><IcoUser /></span>
              <span style={s.panelTitle}>Profile information</span>
            </div>
            <div style={s.panelBody}>
              <form onSubmit={handleUpdateProfile}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Full name">
                  <input
                    type="text" name="name" value={form.name}
                    onChange={handleChange} required
                    onFocus={() => setFocusField('name')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      ...inputStyle,
                      borderColor: focusField === 'name' ? cfg.accent : '#e5e7eb',
                      background:  focusField === 'name' ? '#fff' : '#f9fafb',
                    }}
                    placeholder="Your full name"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} required
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      ...inputStyle,
                      borderColor: focusField === 'email' ? cfg.accent : '#e5e7eb',
                      background:  focusField === 'email' ? '#fff' : '#f9fafb',
                    }}
                    placeholder="Your email"
                  />
                </Field>
                <div style={{ paddingTop: 4 }}>
                  <button type="submit" disabled={loading} style={s.saveBtn(loading)}>
                    {loading
                      ? <><IcoKey /> Saving…</>
                      : <><IcoCheck /> Save changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Account Info Tab */}
        {activeTab === 'info' && (
          <div style={s.panel}>
            <div style={s.panelHead}>
              <span style={{ color: cfg.accent }}><IcoBadge /></span>
              <span style={s.panelTitle}>Account details</span>
            </div>
            <div style={s.panelBody}>
              <div style={s.infoGrid}>
                {[
                  { label: 'Full Name',     value: user?.name,     Icon: IcoUser  },
                  { label: 'Email Address', value: user?.email,    Icon: IcoMail  },
                  { label: 'Role',          value: cfg.label,      Icon: IcoKey   },
                  { label: 'User ID',       value: `#${user?.id}`, Icon: IcoBadge },
                ].map((item, i) => (
                  <div key={i} style={s.infoItem}>
                    <div style={s.infoIcon}><item.Icon /></div>
                    <div>
                      <div style={s.infoKey}>{item.label}</div>
                      <div style={s.infoVal}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: cfg.accent }}><IcoShield /></span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Permissions</span>
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 20,
                    background: cfg.accentLight, color: cfg.accentText,
                  }}>
                    {PERMISSIONS.filter(p => p.roles.includes(user?.role)).length} granted
                  </span>
                </div>
                <div style={s.permGrid}>
                  {PERMISSIONS.map((p, i) => {
                    const granted = p.roles.includes(user?.role)
                    return (
                      <div key={i} style={s.permItem(granted)}>
                        <span style={{ flexShrink: 0 }}>
                          {granted ? <IcoCheck /> : <IcoLock />}
                        </span>
                        {p.perm}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}