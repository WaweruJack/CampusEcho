import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, ArrowLeft, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithDemoProfile, requestPasswordReset, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login({ email, password, rememberMe });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setError('');
    setResetMsg('');
    const res = await requestPasswordReset(resetEmail);
    if (res.error) {
      setError(res.error);
    } else {
      setResetMsg(res.message);
    }
  }

  function handleDemoAccess(type) {
    const res = loginWithDemoProfile(type);
    if (!res.error) {
      navigate(type === 'lecturer' ? '/dashboard/lecturer' : '/dashboard', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to CampusEcho Home</span>
        </Link>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              CampusEcho
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-4">
            {resetMode ? 'Recover your password' : 'Sign in to your portal'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {resetMode
              ? 'Enter your MUST institutional email to receive reset instructions.'
              : 'Access your MUST timetable, notices, campus maps, and EchoBot AI.'}
          </p>

          {!resetMode ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  University Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="b@students.must.ac.ke"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setResetMode(true);
                  }}
                  className="font-medium text-indigo-700 dark:text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  University Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="b@students.must.ac.ke"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
              {resetMsg && <p className="text-xs text-emerald-700 dark:text-emerald-400">{resetMsg}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-sm font-semibold"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError('');
                    setResetMsg('');
                  }}
                  className="py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {!isSupabaseConfigured && !resetMode && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
                <span>Demonstration Mode (Supabase Not Configured)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Preview the portal immediately using labeled sample accounts, or register a new account below.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoAccess('student')}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccess('lecturer')}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Demo Lecturer
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            New to CampusEcho?{' '}
            <Link to="/register" className="font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              Create your MUST account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
