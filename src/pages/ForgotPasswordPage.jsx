import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, GraduationCap, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateStudentEmail } from '../lib/validation';

export default function ForgotPasswordPage() {
  const { user, loading, isPasswordRecovery, requestPasswordReset, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentResult, setSentResult] = useState(null);

  useEffect(() => {
    if (!loading && isPasswordRecovery) {
      navigate('/reset-password', { replace: true });
      return;
    }
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, isPasswordRecovery, navigate]);

  const liveEmailError = email.trim().length > 0 ? validateStudentEmail(email) : '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSentResult(null);

    const emailErr = validateStudentEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setSubmitting(true);
    const res = await requestPasswordReset(email);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSentResult({
      email: email.trim().toLowerCase(),
      message: res.message,
      isDemo: Boolean(res.isDemo),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
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

          <p className="text-xs font-medium text-indigo-700 dark:text-cyan-400 mt-3">
            Password Recovery · Meru University of Science and Technology
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Reset your password
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Enter your MUST student email (<span className="font-mono-nums">@students.must.ac.ke</span>) and we will send you a secure link to update your password.
          </p>

          {sentResult ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{sentResult.isDemo ? 'Reset Request Prepared' : 'Reset Email Sent'}</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {sentResult.message}
                </p>
              </div>

              {!isSupabaseConfigured && sentResult.isDemo && (
                <button
                  type="button"
                  onClick={() => navigate('/reset-password', { state: { demoResetEmail: sentResult.email } })}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Continue to Update Password (Demo)
                </button>
              )}

              <div className="flex items-center justify-between gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSentResult(null);
                    setError('');
                  }}
                  className="font-medium text-indigo-700 dark:text-cyan-400 hover:underline"
                >
                  Use a different email
                </button>
                <Link to="/login" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Email Address (@students.must.ac.ke)
                </label>
                <div className="relative">
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="b@students.must.ac.ke"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {liveEmailError && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{liveEmailError}</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || Boolean(liveEmailError)}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
