import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Calendar, 
  MessageSquareCode, 
  Map, 
  BookOpenCheck, 
  UserCircle, 
  Settings, 
  LogOut,
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onCloseMobileSidebar }) {
  const { logout, userRole, currentProfile } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onCloseMobileSidebar();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Timetable', icon: Calendar, path: '/timetable' },
    { name: 'EchoBot', icon: MessageSquareCode, path: '/echobot' },
    { name: 'Campus Maps', icon: Map, path: '/maps' },
    { name: 'Services', icon: BookOpenCheck, path: '/services' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-250/60 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2563eb] text-white shadow-md shadow-blue-500/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-850 dark:text-white block">CampusEcho</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block -mt-0.5">Student Portal</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobileSidebar}
          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white md:hidden focus:outline-hidden"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Information Decorator */}
      <div className="px-5 py-4 border-b border-slate-250/40 dark:border-slate-900/60 bg-slate-50/75 dark:bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <img
            src={currentProfile.avatar}
            alt={currentProfile.firstName}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 bg-slate-150 dark:bg-slate-800"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {currentProfile.firstName} {currentProfile.lastName}
            </h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate mt-0.5">
              {currentProfile.regNumber}
            </p>
            <span className="inline-block px-1.5 py-0.5 mt-1 text-[9px] font-bold text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-md border border-blue-100 dark:border-blue-900/40 capitalize">
              {userRole} Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobileSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-[#eff6ff] dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 border-l-2 border-[#2563eb] font-extrabold scale-[1.01]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 py-2 border-t border-slate-250/65 dark:border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-300 transition-colors duration-150 text-left focus:outline-hidden"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Slide Over Mechanism) */}
      {isOpen && (
        <div className="relative md:hidden z-50">
          {/* Dark Backdrop */}
          <div 
            onClick={onCloseMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200" 
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-xs flex flex-col bg-slate-950 animate-slide-right shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
