import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Bot,
  MapPin,
  UtensilsCrossed,
  ClipboardList,
  Newspaper,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import NotificationBell from './NotificationBell';

const ROUTE_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/timetable': 'My Timetable',
  '/dashboard/echobot': 'EchoBot AI',
  '/dashboard/maps': 'Campus Maps',
  '/dashboard/services': 'Campus Services',
  '/dashboard/notices': 'Digital Notice Board',
  '/dashboard/news': 'Campus News',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/lecturer': 'Lecturer Portal',
  '/dashboard/profile': 'My Profile',
  '/dashboard/settings': 'Settings',
};

export default function PortalLayout() {
  const { user, logout, isSupabaseConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, siteConfig } = useCampusData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Portal';

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/timetable', label: 'My Timetable', icon: CalendarDays },
    { to: '/dashboard/echobot', label: 'EchoBot AI', icon: Bot },
    { to: '/dashboard/maps', label: 'Campus Maps', icon: MapPin },
    { to: '/dashboard/services', label: 'Campus Services', icon: UtensilsCrossed },
    { to: '/dashboard/notices', label: 'Digital Notice Board', icon: ClipboardList },
    { to: '/dashboard/news', label: 'Campus News', icon: Newspaper },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const isLecturer = user?.role === 'lecturer';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100 dark:bg-slate-950 border-r border-slate-800">
      <div>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-white whitespace-nowrap shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              {siteConfig?.portalName || 'CampusEcho'}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1" aria-label="Portal Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge > 0 && (
                  <span className="font-mono-nums text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {isLecturer && (
            <div className="pt-3 mt-3 border-t border-slate-800">
              <NavLink
                to="/dashboard/lecturer"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-cyan-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Lecturer Portal</span>
                </span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/home"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          <span>About CampusEcho</span>
        </NavLink>
        <NavLink
          to="/dashboard/profile"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <User className="h-4 w-4 shrink-0" />
          <span>My Profile</span>
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors whitespace-nowrap"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[82vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!isSupabaseConfigured && (
          <div className="bg-indigo-950 text-indigo-100 border-b border-indigo-900 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>
                Demonstration Mode: Displaying sample MUST campus data. Configure Supabase keys to connect your live database.
              </span>
            </span>
            <Link
              to="/dashboard/settings"
              className="font-medium text-cyan-300 hover:text-white underline whitespace-nowrap"
            >
              Configure Backend
            </Link>
          </div>
        )}

        {siteConfig?.bannerEnabled && siteConfig?.bannerText && (
          <div
            className={`px-4 sm:px-6 py-2 text-xs font-medium border-b ${
              siteConfig.bannerTone === 'urgent'
                ? 'bg-rose-900 text-rose-50 border-rose-800'
                : siteConfig.bannerTone === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-800'
                : 'bg-sky-900 text-sky-50 border-sky-800'
            }`}
          >
            {siteConfig.bannerText}
          </div>
        )}

        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline whitespace-nowrap">
                MUST Portal
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <h1 className="font-display font-semibold text-slate-900 dark:text-white truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <NotificationBell />

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="h-7 w-7 rounded-md bg-indigo-900 text-white text-xs font-semibold flex items-center justify-center">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
              <span className="hidden md:block text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {user?.role === 'lecturer' ? 'Lecturer' : user?.regNumber || 'Student'}
                </span>
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {siteConfig?.maintenanceMode ? (
            <div className="max-w-lg mx-auto mt-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <GraduationCap className="h-8 w-8 text-indigo-700 dark:text-cyan-400 mx-auto" />
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Scheduled Maintenance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {siteConfig.maintenanceMessage}
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
