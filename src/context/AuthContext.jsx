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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let mounted = true;
      supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted) return;
        if (data?.session?.user) {
          await loadSupabaseProfile(data.session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadSupabaseProfile(session.user);
        } else {
          setUser(null);
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

  async function loadSupabaseProfile(authUser) {
    if (!supabase) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, students(*), lecturers(*)')
      .eq('id', authUser.id)
      .single();

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
        programme: meta.programme || 'BSc. Computer Science',
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
    const phoneErr = validatePhone(payload.phoneNumber);
    if (phoneErr) return { error: phoneErr };
    if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
      return { error: 'First name and last name are required.' };
    }
    if (!payload.regNumber?.trim()) {
      return { error: 'University registration number is required.' };
    }
    if (!payload.programme?.trim()) {
      return { error: 'Please select your course or programme.' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
        options: {
          data: {
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            role: 'student',
            reg_number: payload.regNumber.trim().toUpperCase(),
            programme: payload.programme.trim(),
            phone_number: payload.phoneNumber.trim(),
          },
        },
      });
      if (error) return { error: error.message };
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normalizedEmail,
          first_name: payload.firstName.trim(),
          last_name: payload.lastName.trim(),
          role: 'student',
          phone_number: payload.phoneNumber.trim(),
        });
        await supabase.from('students').upsert({
          id: data.user.id,
          reg_number: payload.regNumber.trim().toUpperCase(),
          programme_name: payload.programme.trim(),
          year_of_study: Number(payload.yearOfStudy) || 1,
        });
        if (data.session) {
          await loadSupabaseProfile(data.user);
        }
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
      regNumber: payload.regNumber.trim().toUpperCase(),
      programme: payload.programme.trim(),
      yearOfStudy: Number(payload.yearOfStudy) || 1,
      phoneNumber: payload.phoneNumber.trim(),
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
    const phoneErr = validatePhone(payload.phoneNumber);
    if (phoneErr) return { error: phoneErr };
    if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
      return { error: 'First name and last name are required.' };
    }
    if (!payload.staffId?.trim() || !payload.department?.trim()) {
      return { error: 'Staff ID and academic department are required.' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    // Institutional verification code prevents unauthorized lecturer elevation
    const hasValidApprovalCode = payload.approvalCode?.trim().toUpperCase() === 'MUST-FACULTY-2026';
    const lecturerStatus = hasValidApprovalCode ? 'approved' : 'pending';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
        options: {
          data: {
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            role: 'lecturer',
            lecturer_status: lecturerStatus,
            staff_id: payload.staffId.trim().toUpperCase(),
            department: payload.department.trim(),
            phone_number: payload.phoneNumber.trim(),
          },
        },
      });
      if (error) return { error: error.message };
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normalizedEmail,
          first_name: payload.firstName.trim(),
          last_name: payload.lastName.trim(),
          role: 'lecturer',
          lecturer_status: lecturerStatus,
          phone_number: payload.phoneNumber.trim(),
        });
        await supabase.from('lecturers').upsert({
          id: data.user.id,
          staff_id: payload.staffId.trim().toUpperCase(),
          department: payload.department.trim(),
        });
        if (data.session) {
          await loadSupabaseProfile(data.user);
        }
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
      phoneNumber: payload.phoneNumber.trim(),
      isDemo: true,
    };

    saveStoredDemoUsers([...existing, newUser]);
    const { password: _removed, ...safeUser } = newUser;
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { user: safeUser, lecturerStatus };
  }

  async function login({ email, password, rememberMe = true }) {
    if (!email?.trim() || !password) {
      return { error: 'Email and password are required.' };
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) return { error: error.message };
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
          'Account not found in local demonstration store. Register a new MUST account or use the Demo Account buttons below.',
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
    setUser(null);
  }

  async function requestPasswordReset(email) {
    if (!email?.trim()) return { error: 'Please enter your university email address.' };
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { error: error.message };
      return { ok: true, message: 'Password reset instructions sent to your email.' };
    }
    return {
      ok: true,
      message:
        'Demo Mode: Password reset email dispatch requires Supabase Authentication to be configured.',
    };
  }

  async function updateProfile(updates) {
    if (!user) return { error: 'No active session.' };
    if (updates.phoneNumber) {
      const phoneErr = validatePhone(updates.phoneNumber);
      if (phoneErr) return { error: phoneErr };
    }

    const updatedUser = {
      ...user,
      firstName: updates.firstName?.trim() || user.firstName,
      lastName: updates.lastName?.trim() || user.lastName,
      phoneNumber: updates.phoneNumber?.trim() ?? user.phoneNumber,
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

  async function changePassword(newPassword) {
    const err = validateStrongPassword(newPassword);
    if (err) return { error: err };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { ok: true };
    }

    if (user && !user.id.startsWith('demo-')) {
      const stored = getStoredDemoUsers();
      const idx = stored.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        stored[idx].password = newPassword;
        saveStoredDemoUsers(stored);
      }
    }
    return { ok: true };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConfigured,
        registerStudent,
        registerLecturer,
        login,
        loginWithDemoProfile,
        logout,
        requestPasswordReset,
        updateProfile,
        changePassword,
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
