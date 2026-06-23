import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import HomeDashboard from './pages/HomeDashboard';
import Timetable from './pages/Timetable';
import EchoBot from './pages/EchoBot';
import CampusMaps from './pages/CampusMaps';
import Services from './pages/Services';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import { Login, Register, ForgotPassword, VerifyEmail } from './pages/AuthPages';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Secure Portal Layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<HomeDashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="echobot" element={<EchoBot />} />
            <Route path="maps" element={<CampusMaps />} />
            <Route path="services" element={<Services />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
