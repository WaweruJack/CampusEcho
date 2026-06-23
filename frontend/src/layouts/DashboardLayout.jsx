import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout() {
  const { isLoggedIn } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Get responsive view title based on current path
  const getViewTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Campus Dashboard';
    if (path === '/timetable') return 'Class Timetable';
    if (path === '/echobot') return 'EchoBot AI Assistant';
    if (path === '/maps') return 'Campus Navigation Maps';
    if (path === '/services') return 'Campus Union Services';
    if (path === '/profile') return 'My Campus Identity';
    if (path === '/settings') return 'Platform Settings';
    return 'CampusEcho Portal';
  };

  return (
    <div id="portal-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-250">
      
      {/* Navigation drawer structure */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)} 
      />

      {/* Main workspace container */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        
        {/* Dynamic header navigation */}
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          viewTitle={getViewTitle()}
        />

        {/* Viewport content area */}
        <main id="primary-workspace" className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Dynamic global page footer footer */}
        <footer className="py-4 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
          CampusEcho Phase 1 Frontend Solution • Kirinyaga & MUST Academic Network Support
        </footer>
      </div>

    </div>
  );
}
