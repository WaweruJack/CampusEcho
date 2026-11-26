import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarPlus,
  CheckCircle2,
  Megaphone,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';
import { DAYS_OF_WEEK } from '../../data/demoData';
import { checkVenueCollision, findAlternativeVenues } from '../../lib/validation';
import StatusIndicator from '../../components/StatusIndicator';

export default function LecturerPortalPage() {
  const { user } = useAuth();
  const {
    units,
    venues,
    timetableSlots,
    saveTimetableSlot,
    publishAnnouncement,
  } = useCampusData();

  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState({
    unitId: units[0]?.id || '',
    venueId: venues[0]?.id || '',
    dayOfWeek: 'Monday',
    startTime: '11:00',
    endTime: '13:00',
    status: 'scheduled',
    changeNote: '',
  });
  const [slotResult, setSlotResult] = useState({ error: '', success: '' });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    unitCode: units[0]?.code || 'CCS 3201',
    category: 'cat',
    body: '',
    isUrgent: true,
  });
  const [noticeResult, setNoticeResult] = useState({ error: '', success: '' });

  const isApproved = user?.role === 'lecturer' && user?.lecturerStatus === 'approved';

  // Live collision & alternative venue check
  const liveCollision = useMemo(() => {
    if (slotForm.status === 'cancelled') return null;
    return checkVenueCollision({
      slots: timetableSlots,
      venueId: slotForm.venueId,
      dayOfWeek: slotForm.dayOfWeek,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      excludeSlotId: editingSlotId,
    });
  }, [timetableSlots, slotForm, editingSlotId]);

  const alternativeVenues = useMemo(() => {
    if (!liveCollision || liveCollision.error) return [];
    return findAlternativeVenues({
      venues,
      slots: timetableSlots,
      dayOfWeek: slotForm.dayOfWeek,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      excludeVenueId: slotForm.venueId,
    });
  }, [liveCollision, venues, timetableSlots, slotForm]);

  if (user?.role !== 'lecturer') {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Lecturer Access Required
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          This workspace is restricted to authorized university lecturers.
        </p>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-8 max-w-2xl">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-xl font-bold text-amber-950 dark:text-amber-100">
              Lecturer Account Pending Approval
            </h2>
            <p className="text-sm text-amber-900 dark:text-amber-200 mt-2 leading-relaxed">
              Your lecturer account ({user.email}, Staff ID {user.staffId || 'Pending'}) is awaiting verification by MUST Faculty Administration. To protect schedule integrity, timetable mutations and official notice publishing remain disabled until approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function startEditSlot(slot) {
    setEditingSlotId(slot.id);
    setSlotForm({
      unitId: slot.unitId,
      venueId: slot.venueId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      changeNote: slot.changeNote || '',
    });
    setSlotResult({ error: '', success: '' });
  }

  function resetSlotForm() {
    setEditingSlotId(null);
    setSlotForm({
      unitId: units[0]?.id || '',
      venueId: venues[0]?.id || '',
      dayOfWeek: 'Monday',
      startTime: '11:00',
      endTime: '13:00',
      status: 'scheduled',
      changeNote: '',
    });
    setSlotResult({ error: '', success: '' });
  }

  async function handleSaveSlot(e) {
    e.preventDefault();
    setSlotResult({ error: '', success: '' });
    const res = await saveTimetableSlot({
      id: editingSlotId,
      ...slotForm,
    });
    if (res.error) {
      setSlotResult({ error: res.error, success: '' });
      return;
    }
    setSlotResult({
      error: '',
      success: res.venueChanged
        ? 'Venue updated! Affected students were notified and Campus Maps destination updated.'
        : editingSlotId
        ? 'Class schedule updated successfully.'
        : 'New class scheduled and added to student timetables.',
    });
    setEditingSlotId(null);
  }

  async function handleQuickCancel(slot) {
    setSlotResult({ error: '', success: '' });
    const res = await saveTimetableSlot({
      id: slot.id,
      unitId: slot.unitId,
      venueId: slot.venueId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'cancelled',
      changeNote: `Cancelled by ${user.firstName} ${user.lastName}.`,
    });
    if (res.ok) {
      setSlotResult({ error: '', success: `${slot.unitCode} marked as cancelled and students notified.` });
    }
  }

  async function handlePublishNotice(e) {
    e.preventDefault();
    setNoticeResult({ error: '', success: '' });
    const res = await publishAnnouncement(noticeForm);
    if (res.error) {
      setNoticeResult({ error: res.error, success: '' });
      return;
    }
    setNoticeForm({
      title: '',
      unitCode: units[0]?.code || 'CCS 3201',
      category: 'cat',
      body: '',
      isUrgent: true,
    });
    setNoticeResult({
      error: '',
      success: 'Announcement published to Digital Notice Board and student notifications.',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Lecturer Academic & Venue Management Portal
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Schedule classes with real-time venue collision detection, manage sudden venue moves, and publish official student alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule & Venue Collision Form */}
        <section className="lg:col-span-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>{editingSlotId ? 'Update / Move Class Venue' : 'Schedule Class & Check Venue'}</span>
            </h3>
            {editingSlotId && (
              <button
                type="button"
                onClick={resetSlotForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveSlot} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course Unit
              </label>
              <select
                value={slotForm.unitId}
                onChange={(e) => setSlotForm((p) => ({ ...p, unitId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} · {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Day
                </label>
                <select
                  value={slotForm.dayOfWeek}
                  onChange={(e) => setSlotForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Classroom / Venue
                </label>
                <select
                  value={slotForm.venueId}
                  onChange={(e) => setSlotForm((p) => ({ ...p, venueId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Session Status
                </label>
                <select
                  value={slotForm.status}
                  onChange={(e) => setSlotForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="scheduled">Scheduled (Upcoming)</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Real-Time Collision Feedback */}
            {liveCollision ? (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-800 dark:text-rose-200 space-y-2">
                <div className="flex items-start gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {liveCollision.error
                      ? liveCollision.error
                      : `Venue Collision: ${liveCollision.unitCode} (${liveCollision.unitName}) occupies this venue from ${liveCollision.startTime} to ${liveCollision.endTime} on ${liveCollision.dayOfWeek}.`}
                  </span>
                </div>
                {alternativeVenues.length > 0 && (
                  <div>
                    <p className="font-medium mb-1.5">Available Alternative Venues:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {alternativeVenues.slice(0, 5).map((alt) => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => setSlotForm((p) => ({ ...p, venueId: alt.id }))}
                          className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40"
                        >
                          Use {alt.name} ({alt.capacity})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Venue is available for {slotForm.dayOfWeek} ({slotForm.startTime} – {slotForm.endTime}). No booking collisions detected.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Change Reason / Note for Students (Optional)
              </label>
              <input
                type="text"
                value={slotForm.changeNote}
                onChange={(e) => setSlotForm((p) => ({ ...p, changeNote: e.target.value }))}
                placeholder="e.g. Moved to Lecture Hall 4 for smartboard projection"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {slotResult.error && <p className="text-xs text-rose-600 dark:text-rose-400">{slotResult.error}</p>}
            {slotResult.success && <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{slotResult.success}</p>}

            <button
              type="submit"
              disabled={Boolean(liveCollision)}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {editingSlotId ? 'Save Schedule Changes & Notify Students' : 'Confirm & Schedule Class'}
            </button>
          </form>
        </section>

        {/* Student Communication / Announcements Form */}
        <section className="lg:col-span-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Student Academic Communication</span>
            </h3>
          </div>

          <form onSubmit={handlePublishNotice} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={noticeForm.title}
                onChange={(e) => setNoticeForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. CAT 1 Date & Coverage for CCS 3201"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Course Unit
                </label>
                <select
                  value={noticeForm.unitCode}
                  onChange={(e) => setNoticeForm((p) => ({ ...p, unitCode: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.code}>
                      {u.code} · {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Announcement Type
                </label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="cat">CAT Announcement</option>
                  <option value="assignment">Assignment Notice</option>
                  <option value="makeup">Class Makeup</option>
                  <option value="venue_change">Venue Change</option>
                  <option value="academic">General Academic Notice</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Message to Students
              </label>
              <textarea
                rows={5}
                required
                value={noticeForm.body}
                onChange={(e) => setNoticeForm((p) => ({ ...p, body: e.target.value }))}
                placeholder="Provide clear instructions, submission deadlines, or makeup venue details..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={noticeForm.isUrgent}
                onChange={(e) => setNoticeForm((p) => ({ ...p, isUrgent: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Flag as urgent academic notification</span>
            </label>

            {noticeResult.error && <p className="text-xs text-rose-600 dark:text-rose-400">{noticeResult.error}</p>}
            {noticeResult.success && <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{noticeResult.success}</p>}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Publish Notice & Notify Students
            </button>
          </form>
        </section>
      </div>

      {/* Existing Scheduled Classes Table */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
            <span>Active Scheduled Sessions ({timetableSlots.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Unit</th>
                <th className="py-3 px-4 font-semibold">Day & Time</th>
                <th className="py-3 px-4 font-semibold">Venue</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {timetableSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {slot.unitCode} · {slot.unitName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">{slot.lecturerName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {slot.dayOfWeek} · {slot.startTime} – {slot.endTime}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div>{slot.venueName}</div>
                    {slot.previousVenueName && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        Prev: {slot.previousVenueName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusIndicator status={slot.status} />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => startEditSlot(slot)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Edit / Move Venue
                    </button>
                    {slot.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleQuickCancel(slot)}
                        className="px-2.5 py-1 rounded border border-rose-200 dark:border-rose-800 font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
