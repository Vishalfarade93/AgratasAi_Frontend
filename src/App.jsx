import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TrendsPage from './pages/TrendsPage'
import ReportsPage from './pages/ReportsPage'
import InsightsPage from './pages/InsightsPage'
import './index.css'

function Protected({ children }) {
  const { seller, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <div style={{ color: '#fff', padding: 40 }}>Loading...</div>
  if (!seller) return <Navigate to="/login" replace />

  return (
    <>
      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay — closes sidebar on tap */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — gets .open class on mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Page content */}
      <div className="page-content">
        {children}
      </div>
    </>
  )
}

function AppRoutes() {
  const { seller } = useAuth()
  return (
    <Routes>
      <Route path="/login"     element={seller ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/trends"    element={<Protected><TrendsPage /></Protected>} />
      <Route path="/reports"   element={<Protected><ReportsPage /></Protected>} />
      <Route path="/insights"  element={<Protected><InsightsPage /></Protected>} />
      <Route path="*"          element={<Navigate to={seller ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
