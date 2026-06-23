import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  FolderPlus, 
  ArrowRight, 
  Coffee,
  HelpCircle
} from 'lucide-react';

export default function Timetable() {
  const { timetable } = useApp();
  const [activeDay, setActiveDay] = useState('monday');

  const weekdays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' }
  ];

  const currentDayClasses = timetable[activeDay] || [];

  // Determine today's list for the quick glance section
  const getTodayList = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[new Date().getDay()];
    const queryKey = (todayKey === 'sunday' || todayKey === 'saturday') ? 'monday' : todayKey;
    return {
      name: queryKey,
      items: timetable[queryKey] || []
    };
  };

  const todayClasses = getTodayList();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT AREA: WEEKLY SCHEDULER VIEW (8 Columns) */}
      <section id="weekly-schedule-view" className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight">University Weekly Lecture Timetable</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Navigate weekday schedules to manage your academic preparations.</p>
          </div>
          <span className="inline-flex items-center space-x-1 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg uppercase">
            <Calendar className="w-3 h-3" />
            <span>May - August 2026 Sem</span>
          </span>
        </div>

        {/* Tab Weekday selectors */}
        <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
          {weekdays.map((day) => (
            <button
              key={day.key}
              id={`tab-select-${day.key}`}
              onClick={() => setActiveDay(day.key)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all duration-150 cursor-pointer ${
                activeDay === day.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="md:hidden">{day.label}</span>
              <span className="hidden md:inline">{day.key}</span>
            </button>
          ))}
        </div>

        {/* Lectures details for selected day */}
        <div className="space-y-4">
          {currentDayClasses.length === 0 ? (
            <div id="timetable-empty-state" className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <Coffee className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No classes scheduled on this day</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Use this free window to work on projects, attend faculty tutoring sessions, or study in our brand-new library wing.
                </p>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-slate-800/40 rounded-2xl border border-blue-50 dark:border-slate-800 max-w-md text-left text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pro Tip for Lecturers</span>
                </h5>
                Need to add makeup classes here? Relocate back to the <strong className="text-blue-600 dark:text-blue-400">Home page</strong>, select "Lecturer View" from the role drawer, draft a "Makeup Class", and choose your target weekday!
              </div>
            </div>
          ) : (
            <div className="space-y-3.5" id="timetable-list">
              {currentDayClasses.map((cls, index) => (
                <div
                  key={index}
                  className="p-5 bg-white dark:bg-slate-850/30 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/40 hover:shadow-xs transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group"
                >
                  {/* Class Info */}
                  <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 pb-3 md:pb-0 border-slate-150 dark:border-slate-800/60">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase">
                      {cls.unitCode}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-805 dark:text-slate-200 leading-tight">
                      {cls.unitName}
                    </h3>
                  </div>

                  {/* Lecturer & Venue Grid */}
                  <div className="md:col-span-5 grid grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="space-y-1 flex items-start space-x-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[9px] block text-slate-400 font-medium">Lecturer</span>
                        <span className="font-bold truncate text-slate-705 dark:text-slate-300 block">{cls.lecturer}</span>
                      </div>
                    </div>

                    <div className="space-y-1 flex items-start space-x-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[9px] block text-slate-400 font-medium">Classroom</span>
                        <span className="font-bold truncate text-slate-705 dark:text-slate-300 block">{cls.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Segment */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end text-xs font-semibold pl-1">
                    <span className="md:hidden text-[10px] text-slate-400">Running Hours:</span>
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-sans font-bold text-[11px]">{cls.time}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* RIGHT AREA: TODAY'S TIMETABLE SIDE SPLIT (4 Columns) */}
      <section id="timetable-side-glance" className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] h-fit space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Daily Quick Glance</h4>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase capitalize">
            {todayClasses.name} Active
          </span>
        </div>

        <div className="space-y-3">
          {todayClasses.items.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No classes remaining today</p>
              <p className="text-[10px] text-slate-450 mt-1">Check back tomorrow morning.</p>
            </div>
          ) : (
            todayClasses.items.map((item, id) => (
              <div 
                key={id} 
                className="p-3 bg-linear-to-b from-slate-50 to-white dark:from-slate-850/10 dark:to-slate-900/40 border border-slate-150 dark:border-slate-800/60 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded shrink-0">
                      {item.unitCode}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-none">
                      {item.unitName}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal font-sans pl-1">
                    ⏱ {item.time} • 📍 {item.venue}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveDay(todayClasses.name)}
                  className="p-1 rounded-lg text-slate-355 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                  title="Locate details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-start space-x-2 text-[10px] text-slate-400">
          <FolderPlus className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 animate-bounce" />
          <p className="leading-tight">
            Class materials, slides, and attendance signatures are controlled and hosted directly in the MUST Academic LMS platform.
          </p>
        </div>
      </section>

    </div>
  );
}
