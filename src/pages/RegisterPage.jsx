import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, GraduationCap, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MUST_PROGRAMMES } from '../data/demoData';
import { getPasswordChecks, validateStudentEmail, validateStaffEmail } from '../lib/validation';

export default function RegisterPage() {
  const { registerStudent, registerLecturer } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    regNumber: '',
    staffId: '',
    email: '',
    phoneNumber: '',
    programme: MUST_PROGRAMMES[0],
    yearOfStudy: '3',
    department: 'Department of Computer Science',
    approvalCode: '',
    password: '',
    confirmPassword: '',
  });

  const passwordChecks = getPasswordChecks(form.password);
  const liveEmailError =
    form.email.trim().length > 0
      ? accountType === 'student'
        ? validateStudentEmail(form.email)
        : validateStaffEmail(form.email)
      : '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    let res;
    if (accountType === 'student') {
      res = await registerStudent(form);
    } else {
      res = await registerLecturer(form);
    }
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.needsEmailConfirm) {
      setInfoMessage('Account created. Check your institutional email to verify your address before logging in.');
      return;
    }

    navigate(accountType === 'lecturer' ? '/dashboard/lecturer' : '/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to CampusEcho Home</span>
        </Link>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              CampusEcho
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-4">
            Create your MUST account
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Meru University of Science and Technology portal registration
          </p>

          {/* Segmented Account Type Selector */}
          <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setError('');
              }}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                accountType === 'student'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('lecturer');
                setError('');
              }}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                accountType === 'lecturer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lecturer Account
            </button>
          </div>

          {accountType === 'lecturer' && (
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Lecturer accounts require institutional approval before publishing notices or scheduling venues. Enter your departmental verification code (demo code: <strong className="font-mono-nums">MUST-FACULTY-2026</strong>) or submit for pending review.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-fname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  id="reg-fname"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="Brian"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="reg-lname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  id="reg-lname"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Kimathi"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            {accountType === 'student' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-number" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      University Registration Number
                    </label>
                    <input
                      id="reg-number"
                      type="text"
                      required
                      value={form.regNumber}
                      onChange={(e) => setForm((p) => ({ ...p, regNumber: e.target.value }))}
                      placeholder="CT201/104521/23"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-year" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Year of Study
                    </label>
                    <select
                      id="reg-year"
                      value={form.yearOfStudy}
                      onChange={(e) => setForm((p) => ({ ...p, yearOfStudy: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-programme" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Course / Programme
                  </label>
                  <select
                    id="reg-programme"
                    value={form.programme}
                    onChange={(e) => setForm((p) => ({ ...p, programme: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {MUST_PROGRAMMES.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="staff-id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Staff ID Number
                    </label>
                    <input
                      id="staff-id"
                      type="text"
                      required
                      value={form.staffId}
                      onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))}
                      placeholder="MUST/SCI/0418"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="dept" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Department
                    </label>
                    <input
                      id="dept"
                      type="text"
                      required
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="approval-code" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Departmental Verification Code (Optional)
                  </label>
                  <input
                    id="approval-code"
                    type="text"
                    value={form.approvalCode}
                    onChange={(e) => setForm((p) => ({ ...p, approvalCode: e.target.value }))}
                    placeholder="Leave blank to submit for admin approval"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  University Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder={accountType === 'student' ? 'b@students.must.ac.ke' : 'name@must.ac.ke'}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {liveEmailError && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{liveEmailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number (For SMS Alerts)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="+254712345678"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Create strong password"
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
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Password strength rules */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {[
                { ok: passwordChecks.minLength, label: 'At least 8 characters' },
                { ok: passwordChecks.hasUpper, label: 'One uppercase letter (A–Z)' },
                { ok: passwordChecks.hasLower, label: 'One lowercase letter (a–z)' },
                { ok: passwordChecks.hasNumber, label: 'One number (0–9)' },
                { ok: passwordChecks.hasSpecial, label: 'One special character (!@#$)' },
              ].map((rule) => (
                <span
                  key={rule.label}
                  className={`flex items-center gap-1.5 ${
                    rule.ok ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {rule.ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                  <span>{rule.label}</span>
                </span>
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                {infoMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {submitting
                ? 'Creating Account...'
                : accountType === 'student'
                ? 'Create Student Account'
                : 'Submit Lecturer Registration'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
