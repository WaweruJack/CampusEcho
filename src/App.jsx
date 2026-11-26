import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CampusDataProvider } from './context/CampusDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/PortalLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OwnerConsolePage from './pages/OwnerConsolePage';

import DashboardOverview from './pages/portal/DashboardOverview';
import TimetablePage from './pages/portal/TimetablePage';
import EchoBotPage from './pages/portal/EchoBotPage';
import CampusMapsPage from './pages/portal/CampusMapsPage';
import CampusServicesPage from './pages/portal/CampusServicesPage';
import NoticeBoardPage from './pages/portal/NoticeBoardPage';
import CampusNewsPage from './pages/portal/CampusNewsPage';
import NotificationsPage from './pages/portal/NotificationsPage';
import LecturerPortalPage from './pages/portal/LecturerPortalPage';
import ProfilePage from './pages/portal/ProfilePage';
import SettingsPage from './pages/portal/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CampusDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/console" element={<OwnerConsolePage />} />

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <LandingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PortalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="timetable" element={<TimetablePage />} />
                <Route path="echobot" element={<EchoBotPage />} />
                <Route path="maps" element={<CampusMapsPage />} />
                <Route path="services" element={<CampusServicesPage />} />
                <Route path="notices" element={<NoticeBoardPage />} />
                <Route path="news" element={<CampusNewsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route
                  path="lecturer"
                  element={
                    <ProtectedRoute requireRole="lecturer">
                      <LecturerPortalPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </CampusDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
