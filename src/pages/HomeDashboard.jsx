import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MessageSquare, 
  Map, 
  BookOpenCheck, 
  Megaphone, 
  Sparkles, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Award,
  ChevronLeft,
  PlusCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
  Archive
} from 'lucide-react';

export default function HomeDashboard() {
  const { 
    userRole, 
    currentProfile, 
    announcements, 
    archiveAnnouncement,
    events, 
    timetable,
    addAnnouncement,
    addAssignment,
    addCATSchedule,
    addMakeupClass,
    addVenueChange
  } = useApp();
  
  const navigate = useNavigate();

  // Active form inside the Lecturer Workspace drawer/overlay
  const [activeFormType, setActiveFormType] = useState(null); // 'announcement', 'assignment', 'cat', 'makeup', 'venue'
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [annForm, setAnnForm] = useState({ title: '', content: '', category: 'Academic' });
  const [asgForm, setAsgForm] = useState({ title: '', unit: '', dueDate: '' });
  const [catForm, setCatForm] = useState({ title: '', unit: '', venue: '', date: '', time: '' });
  const [mkpForm, setMkpForm] = useState({ day: 'Monday', unitCode: '', unitName: '', venue: '', time: '' });
  const [vnForm, setVnForm] = useState({ unitCode: '', oldVenue: '', newVenue: '', time: '' });

  // Get current greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    let greet = 'Good Morning';
    if (hours >= 12 && hours < 17) greet = 'Good Afternoon';
    if (hours >= 17) greet = 'Good Evening';
    return `${greet}, ${currentProfile.title || currentProfile.firstName}`;
  };

  // Resolve today's classes
  const getTodayClasses = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[new Date().getDay()];
    // Fallback to monday if weekend for demo preview
    const dayToQuery = (currentDay === 'saturday' || currentDay === 'sunday') ? 'monday' : currentDay;
    const classes = timetable[dayToQuery] || [];
    return { list: classes, name: dayToQuery };
  };

  const todayClasses = getTodayClasses();

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    addAnnouncement(annForm.title, annForm.content, annForm.category);
    setSuccessMsg('Announcement published successfully! Swapping to Student role will let you see the notice.');
    setAnnForm({ title: '', content: '', category: 'Academic' });
    setTimeout(() => {
      setSuccessMsg('');
      setActiveFormType(null);
    }, 4500);
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    addAssignment(asgForm.title, asgForm.unit, asgForm.dueDate);
    setSuccessMsg('Assignment sent to students through notifications!');
    setAsgForm({ title: '', unit: '', dueDate: '' });
    setTimeout(() => {
      setSuccessMsg('');
      setActiveFormType(null);
    }, 4500);
  };

  const handleCreateCAT = (e) => {
    e.preventDefault();
    addCATSchedule(catForm.title, catForm.unit, catForm.venue, catForm.date, catForm.time);
    setSuccessMsg('Continuous Assessment Test (CAT) added to notice schedules.');
    setCatForm({ title: '', unit: '', venue: '', date: '', time: '' });
    setTimeout(() => {
      setSuccessMsg('');
      setActiveFormType(null);
    }, 4500);
  };

  const handleCreateMakeup = (e) => {
    e.preventDefault();
    addMakeupClass(mkpForm.day, mkpForm.unitCode, mkpForm.unitName, mkpForm.venue, mkpForm.time);
    setSuccessMsg(`Makeup class registered on ${mkpForm.day}! Check Timetable page to review.`);
    setMkpForm({ day: 'Monday', unitCode: '', unitName: '', venue: '', time: '' });
    setTimeout(() => {
      setSuccessMsg('');
      setActiveFormType(null);
    }, 4500);
  };

  const handleCreateVenue = (e) => {
    e.preventDefault();
    addVenueChange(vnForm.unitCode, vnForm.oldVenue, vnForm.newVenue, vnForm.time);
    setSuccessMsg('Lecture relocated! Notifications sent out to registered students.');
    setVnForm({ unitCode: '', oldVenue: '', newVenue: '', time: '' });
    setTimeout(() => {
      setSuccessMsg('');
      setActiveFormType(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      {/* 1. WELCOME PROFILE CARD */}
      <section id="welcome-jumbotron" className="relative p-6 md:p-8 bg-[#2563eb] text-white rounded-2xl shadow-[0_10px_23px_-3px_rgba(37,99,235,0.15)] overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-spin-slow" />
              <span>CampusEcho Sync Connected</span>
            </div>

            <div className="space-y-1">
              <h2 id="welcome-greeting" className="text-2xl md:text-3xl font-black tracking-tight font-sans">
                {getGreeting()}
              </h2>
              <p className="text-sm text-blue-50 font-medium">
                Welcome back to CampusEcho.
              </p>
            </div>

            {/* Quick Info Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-y-3 gap-x-6 text-xs text-blue-100">
              <div>
                <span className="text-blue-200 block text-[9px] font-bold uppercase tracking-wider">University ID / Reg No</span>
                <span className="font-extrabold text-white text-[13px]">{currentProfile.regNumber}</span>
              </div>
              <div>
                <span className="text-blue-200 block text-[9px] font-bold uppercase tracking-wider">Academic Track</span>
                <span className="font-extrabold text-white text-[13px]">{currentProfile.course}</span>
              </div>
            </div>
          </div>
          
          {/* Subtle branding element from professional polish layout */}
          <div className="hidden lg:block text-5xl opacity-20 pr-4 select-none">
            🏛
          </div>
        </div>
      </section>

      {/* 2. LECTURER CONTROL MODULE CARD (DYNAMIC FOR LECTURERS) */}
      {userRole === 'lecturer' && (
        <section id="lecturer-workspace" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-bold text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-md uppercase tracking-widest">
              Faculty Module Workspace
            </span>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 font-sans">
              Lecture Administration Tools
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Draft messages, reschedule sessions, relocate lecture rooms, or notify students instantly.
            </p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* Toolbar Buttons */}
          {!activeFormType ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                id="create-announcement-btn"
                onClick={() => setActiveFormType('announcement')}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer group"
              >
                <Megaphone className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight">Post Announcement</span>
              </button>

              <button
                id="create-assignment-btn"
                onClick={() => setActiveFormType('assignment')}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer group"
              >
                <FileText className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight">Post Assignment</span>
              </button>

              <button
                id="create-cat-btn"
                onClick={() => setActiveFormType('cat')}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight">Schedule CAT</span>
              </button>

              <button
                id="create-makeup-btn"
                onClick={() => setActiveFormType('makeup')}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer group"
              >
                <Clock className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight">Makeup Class</span>
              </button>

              <button
                id="create-venue-btn"
                onClick={() => setActiveFormType('venue')}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer col-span-2 sm:col-span-1 group"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight">Venue Change</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4 text-blue-500" />
                  <span>Drafting: {activeFormType} parameter</span>
                </span>
                <button
                  onClick={() => {
                    setActiveFormType(null);
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Form Render Mapping */}
              {activeFormType === 'announcement' && (
                <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Notice Title</label>
                      <input 
                        type="text" required placeholder="Graduation clearance process..." 
                        value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Category</label>
                      <select 
                        value={annForm.category} onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      >
                        <option>Academic</option>
                        <option>Graduation</option>
                        <option>Elections</option>
                        <option>Sports</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Announcement body text</label>
                    <textarea 
                      required placeholder="Full description of notice details..." rows={3}
                      value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-750">Publish Notice Now</button>
                </form>
              )}

              {activeFormType === 'assignment' && (
                <form onSubmit={handleCreateAssignment} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Assignment Title</label>
                      <input 
                        type="text" required placeholder="Distributed systems catalog..."
                        value={asgForm.title} onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Unit Code</label>
                      <input 
                        type="text" required placeholder="BCS 3101"
                        value={asgForm.unit} onChange={(e) => setAsgForm({ ...asgForm, unit: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Due Date</label>
                      <input 
                        type="date" required 
                        value={asgForm.dueDate} onChange={(e) => setAsgForm({ ...asgForm, dueDate: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-750">Issue Assignment Notification</button>
                </form>
              )}

              {activeFormType === 'cat' && (
                <form onSubmit={handleCreateCAT} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">CAT Assessment Name</label>
                      <input 
                        type="text" required placeholder="Mid-sem CAT 1"
                        value={catForm.title} onChange={(e) => setCatForm({ ...catForm, title: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Course / Unit</label>
                      <input 
                        type="text" required placeholder="BCS 3103: Compiler Construc."
                        value={catForm.unit} onChange={(e) => setCatForm({ ...catForm, unit: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Exam Venue</label>
                      <input 
                        type="text" required placeholder="Main Hall A"
                        value={catForm.venue} onChange={(e) => setCatForm({ ...catForm, venue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Date</label>
                      <input 
                        type="date" required
                        value={catForm.date} onChange={(e) => setCatForm({ ...catForm, date: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Time Window</label>
                      <input 
                        type="text" required placeholder="02:00 PM - 04:00 PM"
                        value={catForm.time} onChange={(e) => setCatForm({ ...catForm, time: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-750">Publish CAT Session</button>
                </form>
              )}

              {activeFormType === 'makeup' && (
                <form onSubmit={handleCreateMakeup} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Scheduled Day</label>
                      <select 
                        value={mkpForm.day} onChange={(e) => setMkpForm({ ...mkpForm, day: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Unit Code</label>
                      <input 
                        type="text" required placeholder="BCS 3101"
                        value={mkpForm.unitCode} onChange={(e) => setMkpForm({ ...mkpForm, unitCode: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Unit Name</label>
                      <input 
                        type="text" required placeholder="Distributed Systems"
                        value={mkpForm.unitName} onChange={(e) => setMkpForm({ ...mkpForm, unitName: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Venue</label>
                      <input 
                        type="text" required placeholder="ICT Lab 3"
                        value={mkpForm.venue} onChange={(e) => setMkpForm({ ...mkpForm, venue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Time Slots</label>
                      <input 
                        type="text" required placeholder="02:00 PM - 05:00 PM"
                        value={mkpForm.time} onChange={(e) => setMkpForm({ ...mkpForm, time: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-750">Add Makeup Session</button>
                </form>
              )}

              {activeFormType === 'venue' && (
                <form onSubmit={handleCreateVenue} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Course Code</label>
                      <input 
                        type="text" required placeholder="BCS 3105"
                        value={vnForm.unitCode} onChange={(e) => setVnForm({ ...vnForm, unitCode: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Time Scheduled</label>
                      <input 
                        type="text" required placeholder="11:00 AM"
                        value={vnForm.time} onChange={(e) => setVnForm({ ...vnForm, time: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Previous Venue</label>
                      <input 
                        type="text" required placeholder="LH 03"
                        value={vnForm.oldVenue} onChange={(e) => setVnForm({ ...vnForm, oldVenue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Relocated Venue</label>
                      <input 
                        type="text" required placeholder="Science Complex Hall B"
                        value={vnForm.newVenue} onChange={(e) => setVnForm({ ...vnForm, newVenue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-750">Execute Room Relocation</button>
                </form>
              )}
            </div>
          )}
        </section>
      )}

      {/* ADMIN LEVEL LOGICAL DECORATOR */}
      {userRole === 'admin' && (
        <section className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl flex items-start space-x-3 text-slate-800 dark:text-slate-300">
          <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-sans">Administrative Superuser Clearance Activated</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You are signed in as Clara Ndora (Director of ICT). As an Administrator you can preview system variables, alter the simulated role from the top-right swapper, or conduct security clearances on the Profile screen.
            </p>
          </div>
        </section>
      )}

      {/* 3. QUICK ACCESS NAVIGATION GRID */}
      <section id="quick-access-section" className="space-y-3.5">
        <h3 className="text-xs font-bold text-[#2563eb] dark:text-blue-400 tracking-wider uppercase font-sans">
          Quick Access Portal
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            id="quick-timetable-card"
            onClick={() => navigate('/timetable')}
            className="flex items-start justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all text-left group cursor-pointer border-b-2 hover:border-b-[#2563eb]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Class Timetable</h4>
                <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-1 leading-normal">Weekly scheduled lectures and venues</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="quick-echobot-card"
            onClick={() => navigate('/echobot')}
            className="flex items-start justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all text-left group cursor-pointer border-b-2 hover:border-b-[#2563eb]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">EchoBot AI</h4>
                <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-1 leading-normal">Get instant support on campus metrics</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="quick-maps-card"
            onClick={() => navigate('/maps')}
            className="flex items-start justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all text-left group cursor-pointer border-b-2 hover:border-b-[#2563eb]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Campus Maps</h4>
                <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-1 leading-normal">Interactive details on campus blocks</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="quick-services-card"
            onClick={() => navigate('/services')}
            className="flex items-start justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all text-left group cursor-pointer border-b-2 hover:border-b-[#2563eb]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Union Services</h4>
                <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-1 leading-normal font-sans">Cafeteria menu, news feeds, notice board</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </section>

      {/* 4. DASHBOARD WIDGETS BENTO HUB */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WIDGET A: TODAY'S CLASSES TIMETABLE CARDS (7 Columns) */}
        <div id="today-classes-widget" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#2563eb]" />
              <span className="font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100">Today's Academic Classes</span>
            </div>
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 capitalize">
              {todayClasses.name} Active
            </span>
          </div>

          <div className="space-y-3">
            {todayClasses.list.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-605 dark:text-slate-400">No scheduled classes today</p>
                <p className="text-[10px] text-slate-400">Enjoy your study break or consult in active labs.</p>
              </div>
            ) : (
              todayClasses.list.map((cls, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800/80 rounded-xl hover:border-blue-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-[#2563eb] dark:text-blue-450 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        {cls.unitCode}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cls.unitName}
                      </h5>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-0.5 font-sans">
                      <p>Lecturer: <span className="font-semibold text-slate-700 dark:text-slate-300">{cls.lecturer}</span></p>
                      <p>Venue: <span className="font-semibold text-slate-700 dark:text-slate-300">{cls.venue}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg inline-block font-mono">
                      {cls.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => navigate('/timetable')}
            className="w-full py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-[#2563eb] dark:text-blue-400 text-center rounded-xl transition-colors border border-dashed border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            View Weekly Planner Schedule
          </button>
        </div>

        {/* WIDGET B: UPCOMING EVENTS (5 Columns) */}
        <div id="upcoming-events-widget" className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100">Upcoming Events Calendar</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="flex items-start space-x-3.5">
                {/* Date icon */}
                <div className="flex flex-col items-center justify-center w-11 h-11 bg-amber-50 dark:bg-amber-900/20 text-amber-650 dark:text-amber-400 rounded-xl shrink-0 font-sans">
                  <span className="text-[8px] font-extrabold uppercase leading-none">{evt.date.split(',')[0]}</span>
                  <span className="text-[13px] font-black mt-0.5 leading-none">{evt.date.match(/\d+/)?.[0] || '15'}</span>
                </div>
                
                <div className="space-y-0.5 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {evt.title}
                  </h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate">
                    {evt.description}
                  </p>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                    {evt.time} • {evt.venue}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/services')}
            className="w-full py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-amber-650 dark:text-amber-450 text-center rounded-xl transition-colors border border-dashed border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            Explore Services & Events Details
          </button>
        </div>

        {/* WIDGET C: ANNOUNCEMENTS BOARD (Full Width — 12 Columns) */}
        <div id="announcements-widget" className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-[#2563eb]" />
              <span className="font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100">Latest Campus Announcements</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Official Releases</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.filter((a) => !a.archived).length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">All announcements cleared or archived</p>
                <p className="text-[10px] text-slate-400 mt-1">Visit the notice bulletin to view or manage archives.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {announcements.filter((a) => !a.archived).slice(0, 3).map((ann) => (
                  <motion.div
                    key={ann.id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                    className="relative overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/35 h-48 shadow-xs"
                  >
                    {/* Behind swipe action feedback */}
                    <div className="absolute inset-0 bg-emerald-500 flex items-center justify-end px-4 text-white font-bold text-xs pointer-events-none">
                      <div className="flex items-center space-x-2">
                        <Archive className="w-4 h-4 animate-bounce" />
                        <span>Archiving notice...</span>
                      </div>
                    </div>

                    <motion.div
                      drag="x"
                      dragDirectionLock
                      dragConstraints={{ left: -100, right: 0 }}
                      dragElastic={{ left: 0.5, right: 0.1 }}
                      onDragEnd={(event, info) => {
                        if (info.offset.x < -60) {
                          archiveAnnouncement(ann.id);
                        }
                      }}
                      className="absolute inset-0 p-4 bg-slate-50/55 dark:bg-slate-850/45 flex flex-col justify-between space-y-3 cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-[#2563eb] dark:text-blue-400 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                            {ann.category}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {ann.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-snug font-sans truncate">
                          {ann.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {ann.content}
                        </p>
                      </div>
                      <div className="pt-2.5 border-t border-slate-150 dark:border-slate-800 text-[9px] text-slate-450 dark:text-slate-450 font-semibold flex items-center justify-between">
                        <span className="truncate">By: {ann.author}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveAnnouncement(ann.id);
                          }}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <button 
            onClick={() => navigate('/services')}
            className="w-full py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-[#2563eb] dark:text-blue-400 text-center rounded-xl transition-colors border border-dashed border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            Launch Digital News & Notice Bulletin
          </button>
        </div>

      </section>

    </div>
  );
}
