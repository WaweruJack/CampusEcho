import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  ShieldCheck, 
  BookOpen, 
  Mail, 
  Save, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  Camera
} from 'lucide-react';

export default function Profile() {
  const { currentProfile, updateProfile } = useApp();

  // Form states initialized with context values
  const [firstName, setFirstName] = useState(currentProfile.firstName);
  const [lastName, setLastName] = useState(currentProfile.lastName);
  const [course, setCourse] = useState(currentProfile.course);
  const [avatar, setAvatar] = useState(currentProfile.avatar);

  const [notif, setNotif] = useState('');

  const avatarCatalog = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      firstName,
      lastName,
      course,
      avatar
    });
    setNotif('Academic Profile identity record saved and propagated successfully! 🎉');
    setTimeout(() => setNotif(''), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT PORTRAIT WORKSPACE (5 Columns) */}
      <section id="profile-portrait-panel" className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center space-y-5">
        
        <div className="relative">
          {/* Avatar frame */}
          <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-blue-500/20 bg-slate-100 dark:bg-slate-800 shadow-lg select-none">
            <img 
              src={avatar} 
              alt={firstName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute bottom-1 right-1 p-1 bg-blue-600 rounded-lg text-white shadow-md">
            <Camera className="w-3.5 h-3.5 animate-pulse" />
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-805 dark:text-slate-100 uppercase tracking-tight">
            {firstName} {lastName}
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-sans">
            Year 3 Support Profile • MUST Informatics Division
          </p>
        </div>

        {/* Dynamic Preset avatar choices list */}
        <div className="space-y-2 w-full pt-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Choose Avatar Photo Shortcut</span>
          <div className="flex items-center justify-center space-x-2">
            {avatarCatalog.map((pic, id) => (
              <button
                key={id}
                onClick={() => setAvatar(pic)}
                className={`w-10 h-10 rounded-xl overflow-hidden border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  avatar === pic 
                    ? 'ring-2 ring-blue-550 border-blue-500 scale-102' 
                    : 'border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <img src={pic} alt="cat pic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 leading-normal text-left flex items-start space-x-2 w-full">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
          <p>
            Your login domain validation is managed globally. Profile details edited here only change local dashboard layout presentations during the live evaluation phase.
          </p>
        </div>

      </section>

      {/* RIGHT EDIT FORM WORKSPACE (7 Columns) */}
      <section id="profile-details-panel" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-6">
        
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Core settings</span>
          <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">Identity Records Manager</h3>
        </div>

        {notif && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notif}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* First Name (EDITABLE) */}
            <div className="space-y-1.5 animate-slide-up">
              <label id="profile-label-firstname" className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
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
                  id="profile-input-firstname"
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border dark:border-transparent rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Last Name (EDITABLE) */}
            <div className="space-y-1.5">
              <label id="profile-label-lastname" className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
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
                  id="profile-input-lastname"
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border dark:border-transparent rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Course unit (EDITABLE) */}
            <div className="col-span-2 space-y-1.5">
              <label id="profile-label-course" className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Course Program
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={course}
                  id="profile-input-course"
                  onChange={(e) => setCourse(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border dark:border-transparent rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Registration Number (READ-ONLY) */}
            <div className="space-y-1.5 opacity-80">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Registration Number (Read-Only)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentProfile.regNumber}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Official Student Email (READ-ONLY) */}
            <div className="space-y-1.5 opacity-80">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Official Email (Read-Only)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={currentProfile.email}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-not-allowed font-medium animate-pulse"
                />
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="profile-save-btn"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer focus:outline-hidden"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </section>

    </div>
  );
}
