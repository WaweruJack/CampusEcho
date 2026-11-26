import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MUST_PROGRAMMES } from '../../data/demoData';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    programme: user?.programme || MUST_PROGRAMMES[0],
  });
  const [profileMsg, setProfileMsg] = useState({ error: '', success: '' });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ error: '', success: '' });

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg({ error: '', success: '' });
    const res = await updateProfile(form);
    if (res.error) {
      setProfileMsg({ error: res.error, success: '' });
    } else {
      setProfileMsg({ error: '', success: 'Profile details updated successfully.' });
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPassMsg({ error: '', success: '' });
    if (newPassword !== confirmPassword) {
      setPassMsg({ error: 'Passwords do not match.', success: '' });
      return;
    }
    const res = await changePassword(newPassword);
    if (res.error) {
      setPassMsg({ error: res.error, success: '' });
    } else {
      setNewPassword('');
      setConfirmPassword('');
      setPassMsg({ error: '', success: 'Password updated successfully.' });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          My Academic Profile
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          View your university identity and manage permitted contact details and credentials.
        </p>
      </div>

      {/* Identity Summary */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
          <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.role === 'lecturer' ? 'Staff ID' : 'Registration Number'}
          </p>
          <p className="font-mono-nums font-semibold text-slate-900 dark:text-white mt-0.5">
            {user?.role === 'lecturer' ? user?.staffId || 'MUST Staff' : user?.regNumber || 'Not set'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">University Email</p>
          <p className="font-semibold text-slate-900 dark:text-white mt-0.5 break-all">
            {user?.email}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.role === 'lecturer' ? 'Department' : 'Course / Programme'}
          </p>
          <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
            {user?.programme || user?.department || 'MUST'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
          <p className="font-mono-nums font-semibold text-slate-900 dark:text-white mt-0.5">
            {user?.phoneNumber || 'Not provided'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Account Type</p>
          <p className="font-semibold text-indigo-700 dark:text-cyan-400 capitalize mt-0.5">
            {user?.role}
            {user?.role === 'lecturer' && user?.lecturerStatus ? ` (${user.lecturerStatus})` : ''}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Profile Form */}
        <form
          onSubmit={handleProfileSave}
          className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
            <span>Update Contact & Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number (For SMS Alerts)
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="+254712345678"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {user?.role === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course / Programme
              </label>
              <select
                value={form.programme}
                onChange={(e) => setForm((p) => ({ ...p, programme: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {MUST_PROGRAMMES.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          )}

          {profileMsg.error && <p className="text-xs text-rose-600 dark:text-rose-400">{profileMsg.error}</p>}
          {profileMsg.success && <p className="text-xs text-emerald-700 dark:text-emerald-400">{profileMsg.success}</p>}

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold"
          >
            Save Profile Changes
          </button>
        </form>

        {/* Change Password Form */}
        <form
          onSubmit={handlePasswordSave}
          className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Lock className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
            <span>Change Password</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, upper, lower, number, symbol"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {passMsg.error && <p className="text-xs text-rose-600 dark:text-rose-400">{passMsg.error}</p>}
          {passMsg.success && <p className="text-xs text-emerald-700 dark:text-emerald-400">{passMsg.success}</p>}

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 text-white text-xs font-semibold"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
