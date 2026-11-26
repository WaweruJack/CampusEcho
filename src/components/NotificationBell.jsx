import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';

function formatAlertTime(isoDate) {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    handleRealtimeNotification,
  } = useCampusData();

  const [open, setOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('idle');
  const containerRef = useRef(null);

  const unreadAlerts = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );

  // Subscribe to Supabase Realtime changes on the 'notifications' table
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setRealtimeStatus('offline');
      return;
    }

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handleRealtimeNotification(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Notifications (${unreadCount} unread)`}
        className={`h-10 w-10 relative inline-flex items-center justify-center rounded-lg border transition-colors ${
          open
            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-cyan-500 dark:bg-slate-800 dark:text-cyan-300'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Unread Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden"
        >
          {/* Dropdown Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Unread Alerts
                </h2>
                <span className="font-mono-nums text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                  ({unreadCount})
                </span>
              </div>
              {isSupabaseConfigured && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  {realtimeStatus === 'connected' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
                  )}
                  <span>
                    {realtimeStatus === 'connected'
                      ? 'Live Realtime sync active'
                      : realtimeStatus === 'error'
                      ? 'Realtime reconnecting'
                      : 'Connecting to live alerts...'}
                  </span>
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Unread Alerts List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {unreadAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No unread alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  New class, venue, and notice alerts will appear here automatically.
                </p>
              </div>
            ) : (
              unreadAlerts.map((alert) => {
                const isUrgentVenue =
                  alert.category === 'venue_change' || alert.category === 'cancelled_class';
                return (
                  <div
                    key={alert.id}
                    className="px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {isUrgentVenue ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
                          )}
                          <span className="capitalize font-semibold text-indigo-700 dark:text-cyan-400">
                            {String(alert.category || 'alert').replace('_', ' ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formatAlertTime(alert.createdAt)}</span>
                        </div>

                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {alert.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {alert.message}
                        </p>

                        {alert.oldVenue && alert.newVenue && (
                          <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            {alert.oldVenue} → {alert.newVenue}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => markNotificationRead(alert.id, true)}
                        title="Mark as read"
                        aria-label={`Mark "${alert.title}" as read`}
                        className="h-7 px-2 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-cyan-600 dark:hover:border-cyan-600 transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <Check className="h-3 w-3" />
                        <span>Read</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline py-1"
            >
              <span>View all notifications & history</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
