import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { PropertyDetailsPage } from './pages/PropertyDetailsPage'
import { QueryProvider } from './providers/QueryProvider'
import { OAuthCallback } from './components/trademe/OAuthCallback'
import './index.css'
import './styles/app-background.css'

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          {/* All routes are now "protected" but authentication is bypassed */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      </Router>
    </QueryProvider>
  )
}

export default App
