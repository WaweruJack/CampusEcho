import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MUST_SCHOOLS, MUST_SCHOOL_PROGRAMMES } from '../data/demoData';
import {
  getPasswordChecks,
  validatePhone,
  validateStrongPassword,
  validateStudentEmail,
} from '../lib/validation';

const DEFAULT_SCHOOL = 'School of Computing and Informatics';
const REQUIRED_STUDENT_EMAIL_SUFFIX = '@students.must.ac.ke';

function validateRegistrationEmail(emailValue) {
  const trimmed = String(emailValue || '').trim().toLowerCase();
  if (!trimmed) {
    return 'University email is required.';
  }
  if (!trimmed.endsWith(REQUIRED_STUDENT_EMAIL_SUFFIX)) {
    return `Invalid student email. Your email must end in ${REQUIRED_STUDENT_EMAIL_SUFFIX} (e.g. b${REQUIRED_STUDENT_EMAIL_SUFFIX}).`;
  }
  return validateStudentEmail(trimmed);
}

export default function RegisterPage() {
  const { user, loading, isPasswordRecovery, registerStudent } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [error, setError] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    regNumber: '',
    email: '',
    phoneNumber: '',
    school: DEFAULT_SCHOOL,
    programme: MUST_SCHOOL_PROGRAMMES[DEFAULT_SCHOOL][0],
    yearOfStudy: '3',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (loading) return;
    if (isPasswordRecovery) {
      navigate('/reset-password', { replace: true });
      return;
    }
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, isPasswordRecovery, navigate]);

  const schoolProgrammes = MUST_SCHOOL_PROGRAMMES[form.school] || [];
  const passwordChecks = getPasswordChecks(form.password);
  const emailValidationMessage = validateRegistrationEmail(form.email);
  const showEmailError =
    (form.email.trim().length > 0 || emailTouched || attemptedSubmit) && Boolean(emailValidationMessage);
  const livePhoneError = form.phoneNumber.trim().length > 0 ? validatePhone(form.phoneNumber, { required: false }) : '';
  const liveMismatchError =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword
      ? 'Passwords do not match.'
      : '';

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  function handleSchoolChange(selectedSchool) {
    const programmesForSchool = MUST_SCHOOL_PROGRAMMES[selectedSchool] || [];
    setForm((prev) => ({
      ...prev,
      school: selectedSchool,
      programme: programmesForSchool[0] || '',
    }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setEmailTouched(true);
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (!form.regNumber.trim()) {
      setError('University registration number is required.');
      return;
    }
    if (!form.school.trim()) {
      setError('Please select your school.');
      return;
    }
    if (!form.programme.trim()) {
      setError('Please select your course or programme.');
      return;
    }
    const emailErr = validateRegistrationEmail(form.email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    const phoneErr = validatePhone(form.phoneNumber, { required: false });
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    const passErr = validateStrongPassword(form.password);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await registerStudent(form);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.needsEmailConfirm) {
      setPendingConfirmationEmail(form.email.trim().toLowerCase());
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
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
            Create your MUST student account
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Register using your official student email ending in <span className="font-mono-nums">@students.must.ac.ke</span> to access CampusEcho.
          </p>

          {pendingConfirmationEmail ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Confirm your student email</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Your account has been created for <span className="font-semibold font-mono-nums">{pendingConfirmationEmail}</span>. Open the verification email in your MUST inbox to activate your account, then sign in.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full text-center py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
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
                    onChange={(e) => updateField('firstName', e.target.value)}
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
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Kimathi"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

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
                    onChange={(e) => updateField('regNumber', e.target.value)}
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
                    onChange={(e) => updateField('yearOfStudy', e.target.value)}
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
                <label htmlFor="reg-school" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  School
                </label>
                <select
                  id="reg-school"
                  value={form.school}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {MUST_SCHOOLS.map((schoolName) => (
                    <option key={schoolName} value={schoolName}>
                      {schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reg-programme" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course / Programme
                </label>
                <select
                  id="reg-programme"
                  value={form.programme}
                  onChange={(e) => updateField('programme', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {schoolProgrammes.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Student Email (@students.must.ac.ke)
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    aria-invalid={showEmailError}
                    aria-describedby={showEmailError ? 'reg-email-error' : undefined}
                    placeholder="b@students.must.ac.ke"
                    className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      showEmailError
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-600'
                    }`}
                  />
                  {showEmailError && (
                    <p id="reg-email-error" role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {emailValidationMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    placeholder="+254712345678"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {livePhoneError && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{livePhoneError}</p>
                  )}
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
                      onChange={(e) => updateField('password', e.target.value)}
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
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {liveMismatchError && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{liveMismatchError}</p>
                  )}
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Creating Account...' : 'Create Student Account'}
              </button>
            </form>
          )}

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
