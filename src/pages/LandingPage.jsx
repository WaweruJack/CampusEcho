import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarDays,
  Bot,
  MapPin,
  Building2,
  ClipboardList,
  Newspaper,
  UtensilsCrossed,
  Bell,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  X,
  Mail,
  Phone,
  MapPinned,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PolicyModal from '../components/PolicyModal';

const HERO_IMG = '/src/assets/images/hero_must_campus_1795679611580.jpg';
const ABOUT_IMG = '/src/assets/images/about_campus_hub_1795679611908.jpg';

const FEATURES = [
  {
    num: '01',
    title: 'Smart Timetable',
    span: 'lg:col-span-2',
    icon: CalendarDays,
    summary:
      'Switch effortlessly between daily and weekly views with automatic free-period calculation, overlapping-class conflict alerts, and clear status labels for upcoming, completed, cancelled, and rescheduled lectures.',
    meta: 'Daily & Weekly Views · Free Period Detection',
  },
  {
    num: '02',
    title: 'AI-Powered EchoBot',
    span: 'lg:col-span-1',
    icon: Bot,
    summary:
      'Ask natural questions about your next class, tomorrow’s schedule, or campus buildings—grounded strictly in verified CampusEcho data.',
    meta: 'Gemini AI · Context-Aware',
  },
  {
    num: '03',
    title: 'Smart Venue Management',
    span: 'lg:col-span-1',
    icon: Building2,
    summary:
      'Prevents double-booked classrooms before they happen and suggests free alternative halls with matching capacity.',
    meta: 'Collision Detection · Alternative Rooms',
  },
  {
    num: '04',
    title: 'Campus Navigation',
    span: 'lg:col-span-2',
    icon: MapPin,
    summary:
      'Explore MUST lecture halls, computer laboratories, libraries, cafeterias, and administration offices. Whenever a lecture venue changes, your navigation target updates automatically.',
    meta: 'Dynamic Next-Class Routing · Building Directory',
  },
  {
    num: '05',
    title: 'Digital Notice Board',
    span: 'lg:col-span-1',
    icon: ClipboardList,
    summary:
      'Official academic notices, CAT schedules, assignment deadlines, and makeup lectures published directly by verified lecturers.',
    meta: 'Role-Verified Publishing · Categorized',
  },
  {
    num: '06',
    title: 'Campus News',
    span: 'lg:col-span-1',
    icon: Newspaper,
    summary:
      'Stay updated on university events, graduation clearance timelines, academic calendars, and campus developments.',
    meta: 'University Events · Academic Calendar',
  },
  {
    num: '07',
    title: 'Student Services',
    span: 'lg:col-span-1',
    icon: UtensilsCrossed,
    summary:
      'Check cafeteria operating hours and meal availability, ICT helpdesk locations, library hours, and health services.',
    meta: 'Cafeterias · Registrar · Support Offices',
  },
  {
    num: '08',
    title: 'Smart Notifications',
    span: 'lg:col-span-3',
    icon: Bell,
    summary:
      'Receive immediate in-platform alerts and automated email notifications whenever a venue moves, a class is cancelled, or an urgent CAT announcement is posted.',
    meta: 'In-App · Email Alerts',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState({ open: false, type: 'privacy' });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState({ loading: false, error: '', ticketRef: '' });

  async function handleContactSubmit(e) {
    e.preventDefault();
    setContactStatus({ loading: true, error: '', ticketRef: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setContactStatus({ loading: false, error: data.error || 'Could not send message.', ticketRef: '' });
        return;
      }
      setContactStatus({ loading: false, error: '', ticketRef: data.ticketRef });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setContactStatus({ loading: false, error: 'Network error. Please try again.', ticketRef: '' });
    }
  }

  return (
    <div id="home" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">CampusEcho</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300" aria-label="Primary">
            <a href="#home" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Home
            </a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              About
            </a>
            <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Contact
            </a>
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Login
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-10 w-10 hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to={user ? '/dashboard' : '/register'}
              className="px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Open Portal' : 'Get Started'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
              Home
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
              Features
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
              About
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
              Contact
            </a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400">
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-cyan-400 mb-3">
                Meru University of Science and Technology · Smart Campus Companion
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-xl [text-wrap:balance]">
                Your Campus. Your Community. Your Connection.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                CampusEcho brings your university experience together. Manage your academic schedule, discover campus services, stay informed and access intelligent assistance from one platform.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6">
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    Zero
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Double-booked halls via collision engine
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    Live
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Venue shift alerts & map rerouting
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    24/7
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Grounded EchoBot AI guidance
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual + Live Portal Preview */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-16/9 bg-slate-900">
                <img
                  src={HERO_IMG}
                  alt="Meru University of Science and Technology campus courtyard"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="text-xs font-medium text-cyan-300">
                      Nchiru Main Campus · Meru County
                    </p>
                    <p className="font-display text-base font-semibold mt-0.5">
                      Centralized Digital Portal for Students & Lecturers
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Portal Capabilities Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Live MUST Student Portal Modules
                  </span>
                  <span className="text-xs text-indigo-700 dark:text-cyan-400 font-medium">
                    Real-Time Sync
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-200/70 dark:border-slate-800/70">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Timetable & Venue Shift Alerts
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Collision-checked halls, free-period windows, and instant email notices
                      </p>
                    </div>
                    <span className="font-mono-nums text-indigo-700 dark:text-cyan-400 font-semibold shrink-0">
                      Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        EchoBot AI & Campus Navigation
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Direct walking routes to lecture halls, labs, libraries, and student offices
                      </p>
                    </div>
                    <span className="font-mono-nums text-indigo-700 dark:text-cyan-400 font-semibold shrink-0">
                      24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-cyan-400">
            Platform Capabilities
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 [text-wrap:balance]">
            Built around how university life actually works
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Eight integrated modules replace scattered WhatsApp groups, printed notice boards, and manual room booking sheets.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.num}
                className={`${feat.span} rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono-nums text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                      {feat.num}.
                    </span>
                    <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-4">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.summary}
                  </p>
                </div>
                <p className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  {feat.meta}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About CampusEcho */}
      <section id="about" className="py-16 lg:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-16/9 bg-slate-100 dark:bg-slate-800">
              <img
                src={ABOUT_IMG}
                alt="MUST students collaborating inside the Innovation and Research Hub"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-cyan-400">
              About CampusEcho
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 [text-wrap:balance]">
              Eliminating venue clashes, missed notices, and campus guesswork
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              At Meru University of Science and Technology, students and lecturers juggle dynamic lecture schedules, lab allocations, and departmental updates across multiple faculties. When a classroom changes unexpectedly or two units are assigned the same hall, learning time is lost.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>
                  Enforces database-level venue collision checks and recommends open halls whenever lecturers schedule or move a class.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>
                  Syncs sudden venue moves directly to student notifications, timetables, and Campus Maps navigation destinations.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>
                  Restricts official notice publishing and schedule editing to verified, approved lecturer accounts.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-cyan-400">
              Contact & Campus Support
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              Get in touch with the CampusEcho team
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Questions about student onboarding, lecturer account verification, or faculty timetable integration at MUST? Send us a message directly.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPinned className="h-4.5 w-4.5 text-indigo-700 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>Meru University of Science and Technology, Meru–Maua Road, Nchiru, Meru County, Kenya</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-indigo-700 dark:text-cyan-400 shrink-0" />
                <span>support@campusecho.must.ac.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-indigo-700 dark:text-cyan-400 shrink-0" />
                <span className="tabular-nums">+254 712 000 400</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleContactSubmit}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Brian Kimathi"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    University or Contact Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="student@students.must.ac.ke"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Lecturer approval or student portal inquiry"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="How can our campus support team assist you?"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {contactStatus.error && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {contactStatus.error}
                </p>
              )}
              {contactStatus.ticketRef && (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Inquiry received (Reference {contactStatus.ticketRef}). Our campus support team will respond shortly.
                </p>
              )}

              <button
                type="submit"
                disabled={contactStatus.loading}
                className="px-5 py-2.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {contactStatus.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
              <span className="font-display text-lg font-bold">CampusEcho</span>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-md">
              CampusEcho – Your Campus, Connected. Built for Meru University of Science and Technology (MUST) students and lecturers to unify schedules, venue management, campus maps, and AI support.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white text-xs tracking-wide mb-3">Portal Links</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#about" className="hover:text-white">About CampusEcho</a></li>
              <li><Link to="/login" className="hover:text-white">Student & Lecturer Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white text-xs tracking-wide mb-3">Legal & Social</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal({ open: true, type: 'privacy' })}
                  className="hover:text-white"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal({ open: true, type: 'terms' })}
                  className="hover:text-white"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <a href="https://www.must.ac.ke" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  MUST Official Website
                </a>
              </li>
              <li>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  X (Twitter) · LinkedIn · Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CampusEcho · Meru University of Science and Technology (MUST), Kenya.
        </div>
      </footer>

      <PolicyModal
        open={policyModal.open}
        type={policyModal.type}
        onClose={() => setPolicyModal({ open: false, type: 'privacy' })}
      />
    </div>
  );
}
