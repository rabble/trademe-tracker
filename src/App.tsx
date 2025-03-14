import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { PropertyDetailsPage } from './pages/PropertyDetailsPage'
import { QueryProvider } from './providers/QueryProvider'
import { OAuthCallback } from './components/trademe/OAuthCallback'
import { DebugPage } from './pages/DebugPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { useAuth } from './hooks/useAuth'
import './index.css'
import './styles/app-background.css'

// Wrapper component to handle auth state and redirect accordingly
function AuthWrapper() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  }
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  // Otherwise show landing page
  return <LandingPage />
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AuthWrapper />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Debug routes */}
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryProvider>
  )
}

export default App
