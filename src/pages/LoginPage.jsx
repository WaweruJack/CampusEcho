import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateStudentEmail } from '../lib/validation';

export default function LoginPage() {
  const { user, loading, isPasswordRecovery, login, loginWithDemoProfile, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Route recovery links to /reset-password and already-authenticated users to the portal
  useEffect(() => {
    if (loading) return;
    if (isPasswordRecovery) {
      navigate('/reset-password', { replace: true });
      return;
    }
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, isPasswordRecovery, navigate, redirectTo]);

  const liveEmailError = email.trim().length > 0 ? validateStudentEmail(email) : '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const emailErr = validateStudentEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setSubmitting(true);
    const res = await login({ email, password, rememberMe });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  function handleDemoAccess() {
    const res = loginWithDemoProfile('student');
    if (!res.error) {
      navigate('/dashboard', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              CampusEcho
            </span>
          </div>

          <p className="text-xs font-medium text-indigo-700 dark:text-cyan-400 mt-3">
            Meru University of Science and Technology (MUST)
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Sign in to CampusEcho
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Use your MUST student email (@students.must.ac.ke) or create a new account to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Student Email Address (@students.must.ac.ke)
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="b@students.must.ac.ke"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              {liveEmailError && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{liveEmailError}</p>
              )}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
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
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-700 dark:text-cyan-400 hover:underline"
              >
                Forgot password?
              </Link>
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

          {!isSupabaseConfigured && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
                <span>Demonstration Mode (Supabase Not Configured)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Explore with sample student account (<span className="font-mono-nums">b@students.must.ac.ke</span>) or register your own student account below.
              </p>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Continue as Demo Student (b@students.must.ac.ke)
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            New to CampusEcho?{' '}
            <Link to="/register" className="font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              Create a new student account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
