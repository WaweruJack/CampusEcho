import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Megaphone,
  Newspaper,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useCampusData } from '../context/CampusDataContext';
import { DAYS_OF_WEEK } from '../data/demoData';
import { checkVenueCollision, findAlternativeVenues } from '../lib/validation';

const TABS = [
  { id: 'site', label: 'Site Controls', icon: Sliders },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'notices', label: 'Notices & Broadcasts', icon: ClipboardList },
  { id: 'news', label: 'Campus News', icon: Newspaper },
  { id: 'services', label: 'Services & Buildings', icon: UtensilsCrossed },
  { id: 'users', label: 'Users & Approvals', icon: Users },
];

export default function OwnerConsolePage() {
  const navigate = useNavigate();
  const {
    buildings,
    venues,
    units,
    timetableSlots,
    announcements,
    news,
    services,
    siteConfig,
    refreshSiteState,
  } = useCampusData();

  // Bearer token kept strictly in React memory (never persisted to browser storage)
  const [adminToken, setAdminToken] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ loading: true, needsSetup: false, configuredViaEnv: false });
  const [authForm, setAuthForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('site');
  const [overview, setOverview] = useState({ supabaseProfiles: [], integrations: {} });
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  // Local editable drafts synced from context/server
  const [configDraft, setConfigDraft] = useState(siteConfig);
  const [slotDraft, setSlotDraft] = useState({
    id: '',
    unitId: units[0]?.id || '',
    venueId: venues[0]?.id || '',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '10:00',
    status: 'scheduled',
    changeNote: '',
  });
  const [noticeDraft, setNoticeDraft] = useState({
    id: '',
    title: '',
    body: '',
    category: 'academic',
    unitCode: 'University Notice',
    authorName: 'CampusEcho Administration',
    isUrgent: false,
  });
  const [broadcastDraft, setBroadcastDraft] = useState({
    title: '',
    message: '',
    category: 'announcement',
  });
  const [newsDraft, setNewsDraft] = useState({
    id: '',
    title: '',
    summary: '',
    content: '',
    category: 'events',
    publishedAt: new Date().toISOString().slice(0, 10),
    authorName: 'MUST Corporate Communications',
  });
  const [serviceDraft, setServiceDraft] = useState({
    id: '',
    name: '',
    serviceType: 'cafeteria',
    buildingId: buildings[0]?.id || '',
    locationDetail: '',
    operatingHours: '',
    description: '',
    offeringsText: '',
  });
  const [editingBuildingId, setEditingBuildingId] = useState(buildings[0]?.id || '');
  const [buildingDraft, setBuildingDraft] = useState(buildings[0] || null);

  useEffect(() => {
    setConfigDraft(siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    const found = buildings.find((b) => b.id === editingBuildingId);
    if (found) setBuildingDraft({ ...found });
  }, [editingBuildingId, buildings]);

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((d) => {
        setAuthStatus({
          loading: false,
          needsSetup: Boolean(d.needsSetup),
          configuredViaEnv: Boolean(d.configuredViaEnv),
        });
      })
      .catch(() => {
        setAuthStatus({ loading: false, needsSetup: false, configuredViaEnv: false });
      });
  }, []);

  const fetchOverview = useCallback(async (tokenToUse) => {
    if (!tokenToUse) return;
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (res.status === 401) {
        setAdminToken('');
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setOverview({
          supabaseProfiles: data.supabaseProfiles || [],
          integrations: data.integrations || {},
        });
      }
    } catch {
      // ignore transient overview error
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchOverview(adminToken);
    }
  }, [adminToken, fetchOverview]);

  function notifySuccess(msg) {
    setFeedback({ error: '', success: msg });
    setTimeout(() => setFeedback((p) => (p.success === msg ? { ...p, success: '' } : p)), 4000);
  }

  function notifyError(msg) {
    setFeedback({ error: msg, success: '' });
  }

  async function adminRequest(endpoint, method, body) {
    setFeedback({ error: '', success: '' });
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setAdminToken('');
      setAuthError('Session expired. Please re-authenticate.');
      return { error: 'Session expired.' };
    }
    if (!res.ok) {
      return { error: data.error || 'Operation failed.' };
    }
    await refreshSiteState();
    await fetchOverview(adminToken);
    return { ok: true, data };
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (authStatus.needsSetup && authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const endpoint = authStatus.needsSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email.trim(),
          password: authForm.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Verification failed.');
        setAuthSubmitting(false);
        return;
      }
      setAdminToken(data.token);
      setAdminEmail(data.email);
      setAuthStatus((p) => ({ ...p, needsSetup: false }));
      setAuthForm({ email: '', password: '', confirmPassword: '' });
    } catch {
      setAuthError('Network error communicating with server.');
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Timetable collision check preview
  const slotCollision = useMemo(() => {
    if (!slotDraft.venueId || slotDraft.status === 'cancelled') return null;
    return checkVenueCollision({
      slots: timetableSlots,
      venueId: slotDraft.venueId,
      dayOfWeek: slotDraft.dayOfWeek,
      startTime: slotDraft.startTime,
      endTime: slotDraft.endTime,
      excludeSlotId: slotDraft.id || null,
    });
  }, [timetableSlots, slotDraft]);

  const alternativeVenues = useMemo(() => {
    if (!slotCollision || slotCollision.error) return [];
    return findAlternativeVenues({
      venues,
      slots: timetableSlots,
      dayOfWeek: slotDraft.dayOfWeek,
      startTime: slotDraft.startTime,
      endTime: slotDraft.endTime,
      excludeVenueId: slotDraft.venueId,
    });
  }, [slotCollision, venues, timetableSlots, slotDraft]);

  // Handlers for each section
  async function handleSaveSiteConfig(e) {
    e.preventDefault();
    const res = await adminRequest('/api/admin/site-config', 'PUT', configDraft);
    if (res.error) notifyError(res.error);
    else notifySuccess('Site settings updated and live across the portal.');
  }

  async function handleSaveSlot(e) {
    e.preventDefault();
    if (slotCollision) {
      notifyError(
        slotCollision.error ||
          `Venue clash with ${slotCollision.unitCode} (${slotCollision.startTime}–${slotCollision.endTime}).`
      );
      return;
    }
    const unitObj = units.find((u) => u.id === slotDraft.unitId);
    const existing = slotDraft.id ? timetableSlots.find((s) => s.id === slotDraft.id) : null;
    const isVenueChanged = existing && existing.venueId !== slotDraft.venueId;

    const record = {
      id: slotDraft.id || `slot-${Date.now()}`,
      unitId: slotDraft.unitId,
      unitCode: unitObj?.code || 'UNIT',
      unitName: unitObj?.name || 'Course Unit',
      lecturerId: unitObj?.lecturerId || 'admin-assigned',
      lecturerName: unitObj?.lecturerName || 'Assigned Lecturer',
      venueId: slotDraft.venueId,
      previousVenueId: isVenueChanged ? existing.venueId : existing?.previousVenueId || null,
      dayOfWeek: slotDraft.dayOfWeek,
      startTime: slotDraft.startTime,
      endTime: slotDraft.endTime,
      status: isVenueChanged && slotDraft.status === 'scheduled' ? 'rescheduled' : slotDraft.status,
      changeNote: slotDraft.changeNote.trim(),
    };

    const nextSlots = slotDraft.id
      ? timetableSlots.map((s) => (s.id === slotDraft.id ? record : s))
      : [...timetableSlots, record];

    const res = await adminRequest('/api/admin/timetable', 'PUT', { slots: nextSlots });
    if (res.error) notifyError(res.error);
    else {
      notifySuccess(slotDraft.id ? 'Timetable slot updated.' : 'New timetable slot added.');
      setSlotDraft({
        id: '',
        unitId: units[0]?.id || '',
        venueId: venues[0]?.id || '',
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        status: 'scheduled',
        changeNote: '',
      });
    }
  }

  async function handleDeleteSlot(id) {
    const nextSlots = timetableSlots.filter((s) => s.id !== id);
    const res = await adminRequest('/api/admin/timetable', 'PUT', { slots: nextSlots });
    if (res.error) notifyError(res.error);
    else notifySuccess('Timetable slot removed.');
  }

  async function handleSaveNotice(e) {
    e.preventDefault();
    if (!noticeDraft.title.trim() || !noticeDraft.body.trim()) {
      notifyError('Notice title and body are required.');
      return;
    }
    const item = {
      id: noticeDraft.id || `ann-${Date.now()}`,
      title: noticeDraft.title.trim(),
      body: noticeDraft.body.trim(),
      category: noticeDraft.category,
      unitCode: noticeDraft.unitCode.trim() || 'University Notice',
      authorName: noticeDraft.authorName.trim() || 'CampusEcho Administration',
      isUrgent: Boolean(noticeDraft.isUrgent),
      createdAt: noticeDraft.id
        ? announcements.find((a) => a.id === noticeDraft.id)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };
    const next = noticeDraft.id
      ? announcements.map((a) => (a.id === noticeDraft.id ? item : a))
      : [item, ...announcements];

    const res = await adminRequest('/api/admin/announcements', 'PUT', { announcements: next });
    if (res.error) notifyError(res.error);
    else {
      notifySuccess(noticeDraft.id ? 'Notice updated.' : 'Notice published to Digital Notice Board.');
      setNoticeDraft({
        id: '',
        title: '',
        body: '',
        category: 'academic',
        unitCode: 'University Notice',
        authorName: 'CampusEcho Administration',
        isUrgent: false,
      });
    }
  }

  async function handleDeleteNotice(id) {
    const res = await adminRequest('/api/admin/announcements', 'PUT', {
      announcements: announcements.filter((a) => a.id !== id),
    });
    if (res.error) notifyError(res.error);
    else notifySuccess('Notice deleted.');
  }

  async function handleSendBroadcast(e) {
    e.preventDefault();
    const res = await adminRequest('/api/admin/broadcast', 'POST', broadcastDraft);
    if (res.error) notifyError(res.error);
    else {
      notifySuccess('Site-wide broadcast notification dispatched.');
      setBroadcastDraft({ title: '', message: '', category: 'announcement' });
    }
  }

  async function handleSaveNews(e) {
    e.preventDefault();
    if (!newsDraft.title.trim() || !newsDraft.summary.trim()) {
      notifyError('News headline and summary are required.');
      return;
    }
    const item = {
      id: newsDraft.id || `news-${Date.now()}`,
      title: newsDraft.title.trim(),
      summary: newsDraft.summary.trim(),
      content: newsDraft.content.trim() || newsDraft.summary.trim(),
      category: newsDraft.category,
      publishedAt: newsDraft.publishedAt || new Date().toISOString().slice(0, 10),
      authorName: newsDraft.authorName.trim() || 'MUST Corporate Communications',
    };
    const next = newsDraft.id ? news.map((n) => (n.id === newsDraft.id ? item : n)) : [item, ...news];
    const res = await adminRequest('/api/admin/news', 'PUT', { news: next });
    if (res.error) notifyError(res.error);
    else {
      notifySuccess(newsDraft.id ? 'News article updated.' : 'News article published.');
      setNewsDraft({
        id: '',
        title: '',
        summary: '',
        content: '',
        category: 'events',
        publishedAt: new Date().toISOString().slice(0, 10),
        authorName: 'MUST Corporate Communications',
      });
    }
  }

  async function handleDeleteNews(id) {
    const res = await adminRequest('/api/admin/news', 'PUT', {
      news: news.filter((n) => n.id !== id),
    });
    if (res.error) notifyError(res.error);
    else notifySuccess('News article removed.');
  }

  async function handleSaveService(e) {
    e.preventDefault();
    if (!serviceDraft.name.trim() || !serviceDraft.operatingHours.trim()) {
      notifyError('Service name and operating hours are required.');
      return;
    }
    const item = {
      id: serviceDraft.id || `srv-${Date.now()}`,
      name: serviceDraft.name.trim(),
      serviceType: serviceDraft.serviceType,
      buildingId: serviceDraft.buildingId || buildings[0]?.id || '',
      locationDetail: serviceDraft.locationDetail.trim(),
      operatingHours: serviceDraft.operatingHours.trim(),
      description: serviceDraft.description.trim(),
      offerings: serviceDraft.offeringsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const next = serviceDraft.id
      ? services.map((s) => (s.id === serviceDraft.id ? item : s))
      : [...services, item];
    const res = await adminRequest('/api/admin/services', 'PUT', { services: next });
    if (res.error) notifyError(res.error);
    else {
      notifySuccess(serviceDraft.id ? 'Campus service updated.' : 'Campus service added.');
      setServiceDraft({
        id: '',
        name: '',
        serviceType: 'cafeteria',
        buildingId: buildings[0]?.id || '',
        locationDetail: '',
        operatingHours: '',
        description: '',
        offeringsText: '',
      });
    }
  }

  async function handleDeleteService(id) {
    const res = await adminRequest('/api/admin/services', 'PUT', {
      services: services.filter((s) => s.id !== id),
    });
    if (res.error) notifyError(res.error);
    else notifySuccess('Campus service removed.');
  }

  async function handleSaveBuilding(e) {
    e.preventDefault();
    if (!buildingDraft) return;
    const next = buildings.map((b) => (b.id === buildingDraft.id ? buildingDraft : b));
    const res = await adminRequest('/api/admin/buildings', 'PUT', { buildings: next });
    if (res.error) notifyError(res.error);
    else notifySuccess('Building details updated.');
  }

  async function handleLecturerStatus(profileId, status) {
    const res = await adminRequest('/api/admin/lecturers/status', 'POST', { profileId, status });
    if (res.error) notifyError(res.error);
    else notifySuccess(`Lecturer account marked as ${status}.`);
  }

  async function handleResetSiteState() {
    const res = await adminRequest('/api/admin/reset-site-state', 'POST');
    if (res.error) notifyError(res.error);
    else notifySuccess('Server site overrides reset to CampusEcho defaults.');
  }

  // Unauthenticated private gate (no public links or CampusEcho navigation advertised)
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
              <Lock className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-bold text-white">
              {authStatus.needsSetup ? 'Initialize Owner Console' : 'Owner Console Access'}
            </h1>
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {authStatus.loading
              ? 'Checking server configuration...'
              : authStatus.needsSetup
              ? 'No owner access password is set in environment secrets yet. Claim your private owner credentials below.'
              : 'Enter your owner email and access password to manage site configuration and content.'}
          </p>

          {!authStatus.loading && (
            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="owner-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner Email
                </label>
                <input
                  id="owner-email"
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => {
                    setAuthForm((p) => ({ ...p, email: e.target.value }));
                    if (authError) setAuthError('');
                  }}
                  placeholder="owner@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="owner-pass" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {authStatus.needsSetup ? 'Create Owner Password (min 8 chars)' : 'Access Password'}
                </label>
                <div className="relative">
                  <input
                    id="owner-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authForm.password}
                    onChange={(e) => {
                      setAuthForm((p) => ({ ...p, password: e.target.value }));
                      if (authError) setAuthError('');
                    }}
                    placeholder="Enter access password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authStatus.needsSetup && (
                <div>
                  <label htmlFor="owner-pass-confirm" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Owner Password
                  </label>
                  <input
                    id="owner-pass-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authForm.confirmPassword}
                    onChange={(e) => {
                      setAuthForm((p) => ({ ...p, confirmPassword: e.target.value }));
                      if (authError) setAuthError('');
                    }}
                    placeholder="Repeat owner password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {authError && (
                <div className="rounded-lg bg-rose-950/60 border border-rose-800 px-3.5 py-2.5 text-xs text-rose-200">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {authSubmitting
                  ? 'Verifying...'
                  : authStatus.needsSetup
                  ? 'Claim & Unlock Console'
                  : 'Unlock Console'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Local demo users for Users tab when Supabase Service Role isn't configured
  const localDemoUsers = (() => {
    try {
      const raw = localStorage.getItem('campusecho_demo_registered_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sliders className="h-4 w-4 text-white" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-sm sm:text-base font-bold truncate">
              CampusEcho Owner Console
            </h1>
            <p className="text-[11px] text-slate-400 truncate font-mono-nums">{adminEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAdminToken('');
              setAdminEmail('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs font-medium text-rose-200 hover:bg-rose-900/70"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metrics Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Timetable Slots', value: timetableSlots.length },
            { label: 'Active Notices', value: announcements.length },
            { label: 'News Articles', value: news.length },
            { label: 'Campus Services', value: services.length },
            { label: 'Campuses Venues', value: venues.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Tab Bar */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3" aria-label="Owner management sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-indigo-900 dark:bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {feedback.error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
            {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback.success}</span>
          </div>
        )}

        {/* TAB 1: SITE CONTROLS */}
        {activeTab === 'site' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveSiteConfig}
              className="lg:col-span-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Global Portal Settings & Live Banner
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Portal Name
                  </label>
                  <input
                    type="text"
                    value={configDraft.portalName}
                    onChange={(e) => setConfigDraft((p) => ({ ...p, portalName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Term Label
                  </label>
                  <input
                    type="text"
                    value={configDraft.academicTerm}
                    onChange={(e) => setConfigDraft((p) => ({ ...p, academicTerm: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Campus Support Email
                </label>
                <input
                  type="email"
                  value={configDraft.supportEmail}
                  onChange={(e) => setConfigDraft((p) => ({ ...p, supportEmail: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Site-Wide Top Banner</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Display an immediate notice bar across all student portal pages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(configDraft.bannerEnabled)}
                    onChange={(e) => setConfigDraft((p) => ({ ...p, bannerEnabled: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={configDraft.bannerText}
                      onChange={(e) => setConfigDraft((p) => ({ ...p, bannerText: e.target.value }))}
                      placeholder="e.g. Exam card verification closes this Friday at 17:00 EAT."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                  </div>
                  <select
                    value={configDraft.bannerTone}
                    onChange={(e) => setConfigDraft((p) => ({ ...p, bannerTone: e.target.value }))}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="urgent">Urgent (Rose)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Temporarily pause student portal access while showing a maintenance screen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(configDraft.maintenanceMode)}
                    onChange={(e) => setConfigDraft((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                </label>

                <textarea
                  rows={2}
                  value={configDraft.maintenanceMessage}
                  onChange={(e) => setConfigDraft((p) => ({ ...p, maintenanceMessage: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Site Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSiteState}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Overrides</span>
                </button>
              </div>
            </form>

            <div className="lg:col-span-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 h-fit">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Database className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
                <span>Server Integrations</span>
              </h2>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Supabase Client Auth & DB', ready: overview.integrations?.supabaseClient },
                  { label: 'Supabase Service Role Key', ready: overview.integrations?.supabaseServiceRole },
                  { label: 'EchoBot Gemini AI', ready: overview.integrations?.gemini },
                  { label: 'Resend Email Dispatch', ready: overview.integrations?.email },
                  { label: 'ENV Admin Access Key', ready: authStatus.configuredViaEnv },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-slate-700 dark:text-slate-300">{row.label}</span>
                    <span className={`font-semibold ${row.ready ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {row.ready ? 'Configured' : 'Optional / Unset'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveSlot}
              className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 h-fit"
            >
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                {slotDraft.id ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Unit</label>
                <select
                  value={slotDraft.unitId}
                  onChange={(e) => setSlotDraft((p) => ({ ...p, unitId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.code} · {u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                <select
                  value={slotDraft.venueId}
                  onChange={(e) => setSlotDraft((p) => ({ ...p, venueId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Day</label>
                  <select
                    value={slotDraft.dayOfWeek}
                    onChange={(e) => setSlotDraft((p) => ({ ...p, dayOfWeek: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-sm"
                  >
                    {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start</label>
                  <input
                    type="time"
                    value={slotDraft.startTime}
                    onChange={(e) => setSlotDraft((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-sm font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End</label>
                  <input
                    type="time"
                    value={slotDraft.endTime}
                    onChange={(e) => setSlotDraft((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-sm font-mono-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={slotDraft.status}
                  onChange={(e) => setSlotDraft((p) => ({ ...p, status: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Change Note</label>
                <input
                  type="text"
                  value={slotDraft.changeNote}
                  onChange={(e) => setSlotDraft((p) => ({ ...p, changeNote: e.target.value }))}
                  placeholder="Optional note for students"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>

              {slotCollision && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                  <p className="font-semibold">
                    {slotCollision.error ||
                      `Venue Clash: ${slotCollision.unitCode} uses this venue (${slotCollision.startTime}–${slotCollision.endTime}).`}
                  </p>
                  {alternativeVenues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {alternativeVenues.slice(0, 3).map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSlotDraft((p) => ({ ...p, venueId: v.id }))}
                          className="px-2 py-1 rounded border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                        >
                          Use {v.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold"
                >
                  {slotDraft.id ? 'Save Changes' : 'Add Slot'}
                </button>
                {slotDraft.id && (
                  <button
                    type="button"
                    onClick={() =>
                      setSlotDraft({
                        id: '',
                        unitId: units[0]?.id || '',
                        venueId: venues[0]?.id || '',
                        dayOfWeek: 'Monday',
                        startTime: '08:00',
                        endTime: '10:00',
                        status: 'scheduled',
                        changeNote: '',
                      })
                    }
                    className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Active Master Timetable ({timetableSlots.length})
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {timetableSlots.map((slot) => (
                  <div key={slot.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {slot.unitCode} · {slot.unitName}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        {slot.dayOfWeek} · {slot.startTime}–{slot.endTime} · {slot.venueName} · {slot.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSlotDraft({
                            id: slot.id,
                            unitId: slot.unitId,
                            venueId: slot.venueId,
                            dayOfWeek: slot.dayOfWeek,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            status: slot.status,
                            changeNote: slot.changeNote || '',
                          })
                        }
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        aria-label="Delete slot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTICES & BROADCASTS */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleSaveNotice}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  {noticeDraft.id ? 'Edit Digital Notice' : 'Publish Digital Notice'}
                </h2>
                <input
                  type="text"
                  required
                  value={noticeDraft.title}
                  onChange={(e) => setNoticeDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Notice headline"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={noticeDraft.category}
                    onChange={(e) => setNoticeDraft((p) => ({ ...p, category: e.target.value }))}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="academic">Academic</option>
                    <option value="venue_change">Venue Change</option>
                    <option value="cat">CAT Schedule</option>
                    <option value="assignment">Assignment</option>
                    <option value="makeup">Makeup Class</option>
                    <option value="deadline">Deadline</option>
                  </select>
                  <input
                    type="text"
                    value={noticeDraft.unitCode}
                    onChange={(e) => setNoticeDraft((p) => ({ ...p, unitCode: e.target.value }))}
                    placeholder="Unit or Office"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={noticeDraft.body}
                  onChange={(e) => setNoticeDraft((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Notice details for students..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeDraft.isUrgent}
                    onChange={(e) => setNoticeDraft((p) => ({ ...p, isUrgent: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Mark as urgent notice</span>
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold">
                    {noticeDraft.id ? 'Update Notice' : 'Publish Notice'}
                  </button>
                  {noticeDraft.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setNoticeDraft({
                          id: '',
                          title: '',
                          body: '',
                          category: 'academic',
                          unitCode: 'University Notice',
                          authorName: 'CampusEcho Administration',
                          isUrgent: false,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <form
                onSubmit={handleSendBroadcast}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Megaphone className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
                  <span>Send Portal Broadcast Alert</span>
                </h2>
                <input
                  type="text"
                  required
                  value={broadcastDraft.title}
                  onChange={(e) => setBroadcastDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Alert title"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  required
                  value={broadcastDraft.message}
                  onChange={(e) => setBroadcastDraft((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Alert message delivered to student notification bells..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <button type="submit" className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 text-white text-xs font-semibold">
                  Send Broadcast Notification
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 h-fit">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Published Notices ({announcements.length})
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {announcements.map((a) => (
                  <div key={a.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {a.isUrgent ? '[Urgent] ' : ''}{a.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setNoticeDraft({
                            id: a.id,
                            title: a.title,
                            body: a.body,
                            category: a.category,
                            unitCode: a.unitCode || 'University Notice',
                            authorName: a.authorName || 'CampusEcho Administration',
                            isUrgent: Boolean(a.isUrgent),
                          })
                        }
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(a.id)}
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        aria-label="Delete notice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPUS NEWS */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveNews}
              className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 h-fit"
            >
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                {newsDraft.id ? 'Edit News Article' : 'Publish Campus News'}
              </h2>
              <input
                type="text"
                required
                value={newsDraft.title}
                onChange={(e) => setNewsDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="Article headline"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newsDraft.category}
                  onChange={(e) => setNewsDraft((p) => ({ ...p, category: e.target.value }))}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="events">Events</option>
                  <option value="graduation">Graduation</option>
                  <option value="student_activities">Student Activities</option>
                  <option value="academic_calendar">Academic Calendar</option>
                  <option value="developments">Campus Developments</option>
                </select>
                <input
                  type="date"
                  value={newsDraft.publishedAt}
                  onChange={(e) => setNewsDraft((p) => ({ ...p, publishedAt: e.target.value }))}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono-nums"
                />
              </div>
              <input
                type="text"
                required
                value={newsDraft.summary}
                onChange={(e) => setNewsDraft((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Short summary"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <textarea
                rows={4}
                value={newsDraft.content}
                onChange={(e) => setNewsDraft((p) => ({ ...p, content: e.target.value }))}
                placeholder="Full article content..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold">
                  {newsDraft.id ? 'Save Article' : 'Publish Article'}
                </button>
                {newsDraft.id && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewsDraft({
                        id: '',
                        title: '',
                        summary: '',
                        content: '',
                        category: 'events',
                        publishedAt: new Date().toISOString().slice(0, 10),
                        authorName: 'MUST Corporate Communications',
                      })
                    }
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 h-fit">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Campus News Feed ({news.length})
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {news.map((n) => (
                  <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.publishedAt} · {n.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setNewsDraft({ ...n })}
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNews(n.id)}
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        aria-label="Delete news"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SERVICES & BUILDINGS */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleSaveService}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3"
              >
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  {serviceDraft.id ? 'Edit Campus Service' : 'Add Campus Service'}
                </h2>
                <input
                  type="text"
                  required
                  value={serviceDraft.name}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Service name"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={serviceDraft.serviceType}
                    onChange={(e) => setServiceDraft((p) => ({ ...p, serviceType: e.target.value }))}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="cafeteria">Cafeteria</option>
                    <option value="registrar">Registrar</option>
                    <option value="ict">ICT Support</option>
                    <option value="health">Health Unit</option>
                    <option value="library">Library</option>
                    <option value="dean">Dean of Students</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={serviceDraft.operatingHours}
                    onChange={(e) => setServiceDraft((p) => ({ ...p, operatingHours: e.target.value }))}
                    placeholder="Mon–Fri: 08:00–17:00"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={serviceDraft.locationDetail}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, locationDetail: e.target.value }))}
                  placeholder="Location detail"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  value={serviceDraft.description}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Service description"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={serviceDraft.offeringsText}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, offeringsText: e.target.value }))}
                  placeholder="Offerings (comma-separated)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <button type="submit" className="w-full py-2 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{serviceDraft.id ? 'Update Service' : 'Add Service'}</span>
                </button>
              </form>

              {buildingDraft && (
                <form
                  onSubmit={handleSaveBuilding}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3"
                >
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Building2 className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
                    <span>Edit Campus Building Directions</span>
                  </h2>
                  <select
                    value={editingBuildingId}
                    onChange={(e) => setEditingBuildingId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    value={buildingDraft.description || ''}
                    onChange={(e) => setBuildingDraft((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                  <textarea
                    rows={2}
                    value={buildingDraft.walkingDirections || ''}
                    onChange={(e) => setBuildingDraft((p) => ({ ...p, walkingDirections: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                  <button type="submit" className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 text-white text-xs font-semibold">
                    Save Building Details
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 h-fit">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Campus Services ({services.length})
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {services.map((s) => (
                  <div key={s.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{s.operatingHours} · {s.locationDetail}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setServiceDraft({
                            ...s,
                            offeringsText: (s.offerings || []).join(', '),
                          })
                        }
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        aria-label="Delete service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USERS & LECTURER APPROVALS */}
        {activeTab === 'users' && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Registered Users & Lecturer Verification
            </h2>

            {overview.supabaseProfiles.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {overview.supabaseProfiles.map((p) => {
                  const st = Array.isArray(p.students) ? p.students[0] : p.students;
                  const lc = Array.isArray(p.lecturers) ? p.lecturers[0] : p.lecturers;
                  return (
                    <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {p.first_name} {p.last_name} · <span className="font-mono-nums">{p.email}</span>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Role: {p.role}
                          {st?.school_name ? ` · ${st.school_name}` : ''}
                          {st?.programme_name ? ` · ${st.programme_name}` : ''}
                          {lc?.staff_id ? ` · Staff ID: ${lc.staff_id} (${p.lecturer_status || 'pending'})` : ''}
                        </p>
                      </div>
                      {p.role === 'lecturer' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLecturerStatus(p.id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLecturerStatus(p.id, 'rejected')}
                            className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 dark:text-rose-300 font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  {overview.integrations?.supabaseServiceRole
                    ? 'No profiles found in Supabase yet.'
                    : 'Add SUPABASE_SERVICE_ROLE_KEY in server secrets to manage live Supabase accounts and approve lecturers directly from this tab.'}
                </p>
                {localDemoUsers.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">Local Session Accounts ({localDemoUsers.length})</p>
                    {localDemoUsers.map((u) => (
                      <div key={u.id} className="py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</span> · {u.email} · {u.school || u.programme}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
