import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide all credentials.');
      return;
    }

    // Smart role deduction based on email or credentials for prototype convenience
    const emailLower = email.toLowerCase();
    if (emailLower.includes('lecturer') || emailLower.includes('mugo') || emailLower.includes('faculty')) {
      login('lecturer');
    } else if (emailLower.includes('admin') || emailLower.includes('ndora') || emailLower.includes('manager')) {
      login('admin');
    } else {
      login('student');
    }
    
    navigate('/');
  };

  const fillQuickCredentials = (role) => {
    if (role === 'student') {
      setEmail('alex.kariuki@students.must.ac.ke');
      setPassword('P@ssword123!');
    } else if (role === 'lecturer') {
      setEmail('jane.mugo@must.ac.ke');
      setPassword('Lecturer@2026!');
    } else {
      setEmail('clara.ndora@must.ac.ke');
      setPassword('Admin@9900!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Welcome to CampusEcho
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Student / Staff Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@students.must.ac.ke"
                className="block w-full pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent dark:border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="block w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent dark:border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot options */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded-md focus:ring-0 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-1.5 focus:outline-hidden cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Mock accounts shortcut list */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center flex items-center justify-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>Role</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => fillQuickCredentials('student')}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-800 transition-all text-center focus:outline-hidden"
            >
              Student
            </button>
            <button
              onClick={() => fillQuickCredentials('lecturer')}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-800 transition-all text-center focus:outline-hidden"
            >
              Lecturer
            </button>
            <button
              onClick={() => fillQuickCredentials('admin')}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-800 transition-all text-center focus:outline-hidden"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Navigation bottom */}
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessages, setErrorMessages] = useState({});

  // Password requirements checklist
  const rules = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const getStrengthScore = () => {
    let score = 0;
    if (rules.length) score++;
    if (rules.hasUpper) score++;
    if (rules.hasLower) score++;
    if (rules.hasNumber) score++;
    if (rules.hasSpecial) score++;
    return score;
  };

  const getStrengthMeta = (score) => {
    switch (score) {
      case 0: return { label: 'Very Weak', color: 'bg-red-500 w-1/5' };
      case 1: return { label: 'Weak', color: 'bg-red-400 w-2/5' };
      case 2: return { label: 'Medium', color: 'bg-amber-400 w-3/5' };
      case 3: return { label: 'Good', color: 'bg-amber-500 w-4/5' };
      case 4:
      case 5: return { label: 'Strong', color: 'bg-emerald-500 w-full' };
      default: return { label: 'Null', color: 'bg-slate-300 w-0' };
    }
  };

  const strength = getStrengthMeta(getStrengthScore());

  const handleRegister = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Domain validation
    if (!email.toLowerCase().endsWith('@students.must.ac.ke')) {
      newErrors.email = 'Student email must end with: @students.must.ac.ke';
    }

    // Password requirements validation
    const score = getStrengthScore();
    if (score < 4) {
      newErrors.password = 'Password does not meet our required university safety strength.';
    }

    // Password matching
    if (password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrorMessages(newErrors);
      return;
    }

    // Navigate to email verification screen on register success
    navigate('/verify-email', { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* First Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}

                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Registration Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  placeholder="CT*/*/2*"
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
                />
              </div>
            </div>

            {/* Course unit */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Course
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g.Computer Science"
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Student Official Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessages(prev => ({ ...prev, email: null }));
                }}
                placeholder="bstudent@students.must.ac.ke"
                className="block w-full pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
              />
            </div>
            {errorMessages.email && (
              <p className="text-[10px] font-bold text-red-500 mt-1">{errorMessages.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessages(prev => ({ ...prev, password: null }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessages(prev => ({ ...prev, confirm: null }));
                  }}
                  placeholder="Re-enter password"
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500/60 focus:bg-white"
                />
              </div>
              {errorMessages.confirm && (
                <p className="text-[10px] font-bold text-red-500 mt-1">{errorMessages.confirm}</p>
              )}
            </div>

          </div>

          {/* PASSWORD STRENGTH MODULE (MANDATORY) */}
          {password.length > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
                <span>Password Strength Status:</span>
                <span className="font-bold uppercase text-blue-600 dark:text-blue-400">{strength.label}</span>
              </div>
              
              {/* Strength scale */}
              <div className="h-1.5 w-full bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} />
              </div>

              {/* Validation checks and bullet checklist */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[9px] font-medium text-slate-500 leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rules.length ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <span className={rules.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>Min 8 characters</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rules.hasUpper ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <span className={rules.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>One uppercase letter</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rules.hasLower ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <span className={rules.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>One lowercase letter</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rules.hasNumber ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <span className={rules.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>One digit number</span>
                </div>
                <div className="col-span-2 flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${rules.hasSpecial ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <span className={rules.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>One special character (e.g. @!#$&*)</span>
                </div>
              </div>
            </div>
          )}

          {errorMessages.password && (
            <p className="text-[10px] font-bold text-red-500">{errorMessages.password}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-md shadow-blue-500/20 hover:shadow-lg transition-all focus:outline-hidden cursor-pointer"
          >
            Create Account
          </button>
        </form>

        {/* Alternate Navigation */}
        <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Login.
          </Link>
        </p>

      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email.');
      return;
    }
    
    // Check school format constraints
    if (!email.toLowerCase().endsWith('@students.must.ac.ke')) {
      setError('Student official email address must contain @students.must.ac.ke domain.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Forgot Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide your students email to receive password recovery details.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/25 text-xs text-red-600 dark:text-red-400 rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Official Student Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="alex.kariuki@students.must.ac.ke"
                    className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all focus:outline-hidden cursor-pointer"
              >
                Send Recovery Code
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              Recovery Link sent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              A recovery link has been sent to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>. Check your inbox for reset instructions.
            </p>
          </div>
        )}

        <div className="text-center text-xs font-semibold">
          <Link 
            to="/login" 
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-2xl p-6 md:p-8 text-center space-y-6">
        
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-[1.05]">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
            Account Email Verified!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
            Your university student identity is successfully verified.
          </p>
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Verification Certificate</span>
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 font-semibold inline-block w-20">Authority:</span> MUST IT Division
          </div>
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 font-semibold inline-block w-20">Token Ref:</span> echobadge-v1-validated
          </div>
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 font-semibold inline-block w-20">Status:</span> Live Active Academic Profile
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md focus:outline-hidden cursor-pointer"
        >
          Proceed to Login
        </button>

      </div>
    </div>
  );
}
