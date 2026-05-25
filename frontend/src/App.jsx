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
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import ReportsPage from './pages/ReportsPage'
import ProjectsPage from './pages/ProjectsPage'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
  return token ? children : <Navigate to="/login" />
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
      <Route path="/reports" element={
        <ProtectedRoute><ReportsPage /></ProtectedRoute>
      } />
      <Route path="/teams" element={
        <ProtectedRoute><TeamsPage /></ProtectedRoute>
      } />
      <Route path="/teams/new" element={
        <ProtectedRoute><CreateTeamPage /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute><AdminPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
    </Routes>
  )
}