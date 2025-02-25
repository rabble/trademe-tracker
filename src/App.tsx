import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginForm } from './components/auth/LoginForm.tsx'
import { RegisterForm } from './components/auth/RegisterForm.tsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { MainLayout } from './components/layout/MainLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { PropertiesPage } from './pages/PropertiesPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
