import { useEffect, useState } from 'react';
import { Sun, Moon, Bell, Database, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { notificationPrefs, updateNotificationPrefs, resetDemoWorkspace } = useCampusData();
  const { isSupabaseConfigured } = useAuth();

  const [prefs, setPrefs] = useState(notificationPrefs);
  const [savedMsg, setSavedMsg] = useState('');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d.integrations))
      .catch(() => setHealth(null));
  }, []);

  async function handleSavePrefs(e) {
    e.preventDefault();
    await updateNotificationPrefs(prefs);
    setSavedMsg('Notification preferences saved.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Portal Settings & Integrations
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure appearance, notification delivery channels, and view Supabase / AI backend setup requirements.
        </p>
      </div>

      {/* Theme Appearance */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Theme Appearance
        </h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-colors flex items-center gap-3 ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Light Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Off-white canvas & crisp cards</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-colors flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-cyan-500 bg-slate-800'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <Moon className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep twilight navy surfaces</p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Preferences */}
      <form
        onSubmit={handleSavePrefs}
        className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
      >
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
          <span>Notification Delivery Preferences</span>
        </h3>

        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">In-Platform Real-Time Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Instant banners and notification center updates</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.inAppEnabled}
              onChange={(e) => setPrefs((p) => ({ ...p, inAppEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Email Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send urgent venue shifts and CAT schedules to your MUST email</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.emailEnabled}
              onChange={(e) => setPrefs((p) => ({ ...p, emailEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">SMS Alerts (Kenya Carrier Delivery)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deliver last-minute lecture room changes via SMS when configured</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.smsEnabled}
              onChange={(e) => setPrefs((p) => ({ ...p, smsEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
          </label>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upcoming Class Reminder Lead Time
            </label>
            <select
              value={prefs.remindMinutesBefore}
              onChange={(e) => setPrefs((p) => ({ ...p, remindMinutesBefore: Number(e.target.value) }))}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            >
              <option value={15}>15 minutes before class</option>
              <option value={30}>30 minutes before class</option>
              <option value={60}>1 hour before class</option>
            </select>
          </div>
        </div>

        {savedMsg && <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{savedMsg}</p>}

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold"
        >
          Save Preferences
        </button>
      </form>

      {/* Backend & Supabase Integration Status */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
            <span>Backend & External Service Readiness</span>
          </h3>
          {!isSupabaseConfigured && (
            <button
              type="button"
              onClick={resetDemoWorkspace}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            {
              name: 'Supabase Auth, PostgreSQL & Realtime',
              ready: isSupabaseConfigured,
              config: 'Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY + running supabase/schema.sql',
            },
            {
              name: 'EchoBot Gemini AI Engine',
              ready: Boolean(health?.gemini),
              config: 'Server-side GEMINI_API_KEY in environment secrets',
            },
            {
              name: 'Email Notifications (Resend)',
              ready: Boolean(health?.email),
              config: 'Optional server-side RESEND_API_KEY & RESEND_FROM_EMAIL',
            },
            {
              name: 'SMS Notifications (Africa’s Talking)',
              ready: Boolean(health?.sms),
              config: 'Optional server-side AFRICASTALKING_API_KEY & AFRICASTALKING_USERNAME',
            },
          ].map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                {item.ready ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Needs Setup</span>
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400">{item.config}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
