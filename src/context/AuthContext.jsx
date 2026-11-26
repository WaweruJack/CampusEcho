import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_USERS } from '../data/demoData';
import {
  validateStudentEmail,
  validateStaffEmail,
  validateStrongPassword,
  validatePhone,
} from '../lib/validation';

const AuthContext = createContext(null);

const DEMO_USERS_STORAGE_KEY = 'campusecho_demo_registered_users';
const DEMO_SESSION_KEY = 'campusecho_demo_active_session';

function getStoredDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(users));
}

function formatAuthError(err) {
  const msg = err?.message || String(err || 'Authentication request failed.');
  if (msg.toLowerCase().includes('invalid path specified in request url')) {
    return 'Invalid Supabase URL configuration. Please verify VITE_SUPABASE_URL is set to your Project URL (https://<project-ref>.supabase.co) without extra path segments.';
  }
  return msg;
}

function hasRecoveryParamsInUrl() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  return (
    hash.includes('type=recovery') ||
    (window.location.pathname === '/reset-password' &&
      (hash.includes('access_token=') || search.includes('code=')))
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => hasRecoveryParamsInUrl());

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let mounted = true;
      supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted) return;
        if (hasRecoveryParamsInUrl()) {
          setIsPasswordRecovery(true);
        }
        if (data?.session?.user) {
          await loadSupabaseProfile(data.session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
        if (session?.user) {
          await loadSupabaseProfile(session.user);
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            setIsPasswordRecovery(false);
          }
        }
      });

      return () => {
        mounted = false;
        listener?.subscription?.unsubscribe();
      };
    }

    // Demo mode session check
    try {
      const rawSession = localStorage.getItem(DEMO_SESSION_KEY) || sessionStorage.getItem(DEMO_SESSION_KEY);
      if (rawSession) {
        setUser(JSON.parse(rawSession));
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  async function ensureStudentRecordsFromMetadata(authUser) {
    if (!supabase || !authUser) return;
    const meta = authUser.user_metadata || {};
    const firstName = meta.first_name || 'MUST';
    const lastName = meta.last_name || 'Student';
    const role = meta.role || 'student';

    await supabase.from('profiles').upsert({
      id: authUser.id,
      email: (authUser.email || '').toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      role,
      lecturer_status: meta.lecturer_status || null,
      phone_number: meta.phone_number || '',
    });

    if (role === 'student' && meta.reg_number) {
      await supabase.from('students').upsert({
        id: authUser.id,
        reg_number: meta.reg_number,
        school_name: meta.school || 'School of Computing and Informatics',
        programme_name: meta.programme || 'BSc. Computer Science',
        year_of_study: Number(meta.year_of_study) || 1,
      });
    }
  }

  async function loadSupabaseProfile(authUser) {
    if (!supabase) return;
    let { data: profile } = await supabase
      .from('profiles')
      .select('*, students(*), lecturers(*)')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!profile) {
      await ensureStudentRecordsFromMetadata(authUser);
      const retry = await supabase
        .from('profiles')
        .select('*, students(*), lecturers(*)')
        .eq('id', authUser.id)
        .maybeSingle();
      profile = retry.data;
    }

    if (profile) {
      const studentRec = Array.isArray(profile.students) ? profile.students[0] : profile.students;
      const lecturerRec = Array.isArray(profile.lecturers) ? profile.lecturers[0] : profile.lecturers;
      setUser({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        lecturerStatus: profile.lecturer_status,
        phoneNumber: profile.phone_number || '',
        regNumber: studentRec?.reg_number || '',
        school: studentRec?.school_name || lecturerRec?.department || '',
        programme: studentRec?.programme_name || lecturerRec?.department || '',
        yearOfStudy: studentRec?.year_of_study || 1,
        staffId: lecturerRec?.staff_id || '',
        department: lecturerRec?.department || '',
        isDemo: false,
      });
    } else {
      const meta = authUser.user_metadata || {};
      setUser({
        id: authUser.id,
        email: authUser.email,
        firstName: meta.first_name || 'MUST',
        lastName: meta.last_name || 'User',
        role: meta.role || 'student',
        lecturerStatus: meta.lecturer_status || null,
        phoneNumber: meta.phone_number || '',
        regNumber: meta.reg_number || '',
        school: meta.school || 'School of Computing and Informatics',
        programme: meta.programme || 'BSc. Computer Science',
        yearOfStudy: Number(meta.year_of_study) || 1,
        staffId: meta.staff_id || '',
        department: meta.department || '',
        isDemo: false,
      });
    }
  }

  async function registerStudent(payload) {
    const emailErr = validateStudentEmail(payload.email);
    if (emailErr) return { error: emailErr };
    const passErr = validateStrongPassword(payload.password);
    if (passErr) return { error: passErr };
    const phoneErr = validatePhone(payload.phoneNumber, { required: false });
    if (phoneErr) return { error: phoneErr };
    if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
      return { error: 'First name and last name are required.' };
    }
    if (!payload.regNumber?.trim()) {
      return { error: 'University registration number is required.' };
    }
    if (!payload.school?.trim()) {
      return { error: 'Please select your school.' };
    }
    if (!payload.programme?.trim()) {
      return { error: 'Please select your course or programme.' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const trimmedPhone = payload.phoneNumber?.trim() || '';
    const trimmedRegNo = payload.regNumber.trim().toUpperCase();
    const trimmedSchool = payload.school.trim();
    const yearNum = Number(payload.yearOfStudy) || 1;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            role: 'student',
            reg_number: trimmedRegNo,
            school: trimmedSchool,
            programme: payload.programme.trim(),
            year_of_study: yearNum,
            phone_number: trimmedPhone,
          },
        },
      });
      if (error) return { error: formatAuthError(error) };

      // Supabase returns an empty identities array when email is already registered with confirmation enabled
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: 'An account with this university email already exists. Please sign in or reset your password.' };
      }

      if (data?.user && data?.session) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normalizedEmail,
          first_name: payload.firstName.trim(),
          last_name: payload.lastName.trim(),
          role: 'student',
          phone_number: trimmedPhone,
        });
        if (!profileErr) {
          await supabase.from('students').upsert({
            id: data.user.id,
            reg_number: trimmedRegNo,
            school_name: trimmedSchool,
            programme_name: payload.programme.trim(),
            year_of_study: yearNum,
          });
        }
        await loadSupabaseProfile(data.user);
      }

      return {
        user: data?.user,
        needsEmailConfirm: !data?.session,
      };
    }

    // Demo mode registration with real local persistence
    const existing = getStoredDemoUsers();
    if (existing.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { error: 'An account with this university email already exists.' };
    }

    const newUser = {
      id: `student-${Date.now()}`,
      email: normalizedEmail,
      password: payload.password,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      role: 'student',
      lecturerStatus: null,
      regNumber: trimmedRegNo,
      school: trimmedSchool,
      programme: payload.programme.trim(),
      yearOfStudy: yearNum,
      phoneNumber: trimmedPhone,
      isDemo: true,
    };

    saveStoredDemoUsers([...existing, newUser]);
    const { password: _removed, ...safeUser } = newUser;
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { user: safeUser, needsEmailConfirm: false };
  }

  async function registerLecturer(payload) {
    const emailErr = validateStaffEmail(payload.email);
    if (emailErr) return { error: emailErr };
    const passErr = validateStrongPassword(payload.password);
    if (passErr) return { error: passErr };
    const phoneErr = validatePhone(payload.phoneNumber, { required: false });
    if (phoneErr) return { error: phoneErr };
    if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
      return { error: 'First name and last name are required.' };
    }
    if (!payload.staffId?.trim() || !payload.department?.trim()) {
      return { error: 'Staff ID and academic department are required.' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const hasValidApprovalCode = payload.approvalCode?.trim().toUpperCase() === 'MUST-FACULTY-2026';
    const lecturerStatus = hasValidApprovalCode ? 'approved' : 'pending';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            role: 'lecturer',
            lecturer_status: lecturerStatus,
            staff_id: payload.staffId.trim().toUpperCase(),
            department: payload.department.trim(),
            phone_number: payload.phoneNumber?.trim() || '',
          },
        },
      });
      if (error) return { error: formatAuthError(error) };
      if (data?.user && data?.session) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normalizedEmail,
          first_name: payload.firstName.trim(),
          last_name: payload.lastName.trim(),
          role: 'lecturer',
          lecturer_status: lecturerStatus,
          phone_number: payload.phoneNumber?.trim() || '',
        });
        await supabase.from('lecturers').upsert({
          id: data.user.id,
          staff_id: payload.staffId.trim().toUpperCase(),
          department: payload.department.trim(),
        });
        await loadSupabaseProfile(data.user);
      }
      return { user: data?.user, lecturerStatus, needsEmailConfirm: !data?.session };
    }

    const existing = getStoredDemoUsers();
    if (existing.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { error: 'An account with this institutional email already exists.' };
    }

    const newUser = {
      id: `lecturer-${Date.now()}`,
      email: normalizedEmail,
      password: payload.password,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      role: 'lecturer',
      lecturerStatus,
      staffId: payload.staffId.trim().toUpperCase(),
      department: payload.department.trim(),
      programme: payload.department.trim(),
      phoneNumber: payload.phoneNumber?.trim() || '',
      isDemo: true,
    };

    saveStoredDemoUsers([...existing, newUser]);
    const { password: _removed, ...safeUser } = newUser;
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { user: safeUser, lecturerStatus };
  }

  async function login({ email, password, rememberMe = true }) {
    const emailErr = validateStudentEmail(email);
    if (emailErr) {
      return { error: emailErr };
    }
    if (!password) {
      return { error: 'Password is required.' };
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) return { error: formatAuthError(error) };
      if (data?.user) {
        await loadSupabaseProfile(data.user);
      }
      return { user: data?.user };
    }

    // Demo mode check against locally registered users
    const stored = getStoredDemoUsers();
    const matched = stored.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!matched) {
      return {
        error:
          'Account not found. Please create a new student account or use the Demo Student access below.',
      };
    }
    if (matched.password !== password) {
      return { error: 'Incorrect password. Please try again.' };
    }

    const { password: _removed, ...safeUser } = matched;
    if (rememberMe) {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } else {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
    setUser(safeUser);
    return { user: safeUser };
  }

  function loginWithDemoProfile(type) {
    if (isSupabaseConfigured) {
      return { error: 'Demo profiles are disabled when live Supabase is connected.' };
    }
    const demoUser = type === 'lecturer' ? DEMO_USERS.lecturer : DEMO_USERS.student;
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return { user: demoUser };
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setIsPasswordRecovery(false);
    setUser(null);
  }

  async function requestPasswordReset(email) {
    const emailErr = validateStudentEmail(email);
    if (emailErr) return { error: emailErr };
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: formatAuthError(error) };
      return {
        ok: true,
        message: `Password reset instructions have been sent to ${normalizedEmail}. Open the link in your inbox to set a new password.`,
      };
    }

    return {
      ok: true,
      isDemo: true,
      email: normalizedEmail,
      message:
        'Demo Mode: Live reset emails require Supabase Authentication configuration. You can continue below to test the password update page locally.',
    };
  }

  async function updatePassword(newPassword, { demoEmail } = {}) {
    const err = validateStrongPassword(newPassword);
    if (err) return { error: err };

    if (isSupabaseConfigured && supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { error: 'Your password reset session has expired or is missing. Please request a new reset link.' };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: formatAuthError(error) };
      setIsPasswordRecovery(false);
      return { ok: true };
    }

    const targetEmail = (demoEmail || user?.email || '').trim().toLowerCase();
    const stored = getStoredDemoUsers();
    const idx = stored.findIndex(
      (u) => (user?.id && u.id === user.id) || (targetEmail && u.email.toLowerCase() === targetEmail)
    );
    if (idx !== -1) {
      stored[idx].password = newPassword;
      saveStoredDemoUsers(stored);
      setIsPasswordRecovery(false);
      return { ok: true };
    }

    if (targetEmail === DEMO_USERS.student.email.toLowerCase() || (user && user.id.startsWith('demo-'))) {
      setIsPasswordRecovery(false);
      return { ok: true };
    }

    return { error: 'No matching local student account was found to update.' };
  }

  async function updateProfile(updates) {
    if (!user) return { error: 'No active session.' };
    if (updates.phoneNumber) {
      const phoneErr = validatePhone(updates.phoneNumber, { required: false });
      if (phoneErr) return { error: phoneErr };
    }

    const updatedUser = {
      ...user,
      firstName: updates.firstName?.trim() || user.firstName,
      lastName: updates.lastName?.trim() || user.lastName,
      phoneNumber: updates.phoneNumber?.trim() ?? user.phoneNumber,
      school: updates.school?.trim() || user.school,
      programme: updates.programme?.trim() || user.programme,
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          phone_number: updatedUser.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) return { error: error.message };

      if (user.role === 'student') {
        await supabase
          .from('students')
          .update({
            school_name: updatedUser.school || 'School of Computing and Informatics',
            programme_name: updatedUser.programme,
          })
          .eq('id', user.id);
      }
    } else {
      const stored = getStoredDemoUsers();
      const idx = stored.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], ...updatedUser };
        saveStoredDemoUsers(stored);
      }
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(updatedUser));
    }

    setUser(updatedUser);
    return { user: updatedUser };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConfigured,
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
        registerStudent,
        registerLecturer,
        login,
        loginWithDemoProfile,
        logout,
        requestPasswordReset,
        updatePassword,
        changePassword: updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
