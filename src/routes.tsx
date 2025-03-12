import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradeMeSearchPage } from './pages/TradeMeSearchPage';
import { TradeMeCallbackPage } from './pages/TradeMeCallbackPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/trademe-search" element={<TradeMeSearchPage />} />
      <Route path="/settings/trademe-callback" element={<TradeMeCallbackPage />} />
    </Routes>
  );
}
