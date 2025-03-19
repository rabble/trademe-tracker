import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradeMeSearchPage } from './pages/TradeMeSearchPage';
import { TradeMeCallbackPage } from './pages/TradeMeCallbackPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { FAQPage } from './pages/FAQPage';
import { useAuth } from './hooks/useAuth';

// Wrapper component to handle auth state and redirect accordingly
function AuthWrapper() {
  const { user, loading } = useAuth();
  
  console.log('AuthWrapper state:', { user, loading });
  
  // For demo purposes, always show the landing page initially
  // This ensures we display content even if Supabase credentials are missing
  console.log('Showing landing page');
  return <LandingPage />;
  
  // Original behavior with auth check - uncomment when Supabase is properly configured
  /*
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  // If user is logged in, redirect to dashboard
  if (user) {
    console.log('User is logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('No user found, showing landing page');
  // Otherwise show landing page
  return <LandingPage />;
  */
}

/**
 * Application routes configuration
 * Includes public and protected routes with auth checking
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthWrapper />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/coming-soon" element={<ComingSoonPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/trademe-search" element={<TradeMeSearchPage />} />
      </Route>
      
      {/* TradeMe OAuth callback routes */}
      <Route path="/settings/trademe-callback" element={<TradeMeCallbackPage />} />
      
      {/* Redirect from old callback URL for backward compatibility */}
      <Route path="/oauth-callback" element={<Navigate to="/settings/trademe-callback" replace />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
