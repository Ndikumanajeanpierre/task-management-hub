import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import CreateProjectPage from './pages/CreateProjectPage'
import CreateTeamPage from './pages/CreateTeamPage'
import TeamsPage from './pages/TeamsPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TasksPage from './pages/TasksPage'
import ProjectsPage from './pages/ProjectsPage'
import CalendarPage from './pages/CalendarPage'
import ReportsPage from './pages/ReportsPage'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { token, loading, user } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

const ReportsRoute = ({ children }) => {
  const { token, loading, user } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin' && user?.role !== 'manager') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute><ProjectsPage /></ProtectedRoute>
      } />
      <Route path="/projects/new" element={
        <ProtectedRoute><CreateProjectPage /></ProtectedRoute>
      } />
      <Route path="/projects/:id" element={
        <ProtectedRoute><BoardPage /></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><TasksPage /></ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute><CalendarPage /></ProtectedRoute>
      } />
      <Route path="/teams" element={
        <ProtectedRoute><TeamsPage /></ProtectedRoute>
      } />
      <Route path="/teams/new" element={
        <ProtectedRoute><CreateTeamPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><SettingsPage /></ProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute><AdminPage /></AdminRoute>
      } />

      <Route path="/reports" element={
        <ReportsRoute><ReportsPage /></ReportsRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}