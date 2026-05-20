import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import CreateProjectPage from './pages/CreateProjectPage'
import AdminPage from './pages/AdminPage'

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
      <Route path="/projects/new" element={
        <ProtectedRoute><CreateProjectPage /></ProtectedRoute>
      } />
      <Route path="/projects/:id" element={
        <ProtectedRoute><BoardPage /></ProtectedRoute>
      } />
      <Route path="/admin" element={
  <ProtectedRoute><AdminPage /></ProtectedRoute>
} />
    </Routes>
    
  )
}