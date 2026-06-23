import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Mail, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Info, 
  Inbox, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useApp();

  // Notification states
  const [inAppNotif, setInAppNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  // FAQ state index
  const [openFaq, setOpenFaq] = useState(null);

  // Support form state
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState('Technical Support');
  const [ticketLogged, setTicketLogged] = useState(false);

  const faqs = [
    {
      q: 'How do I resolve timetable overlaps?',
      a: 'Timetable overlaps should be reported directly to your department exam coordinator or departmental head. You can also monitor real-time makeup updates posted by faculty blocks on the home page.'
    },
    {
      q: 'Where can I collect my exam card?',
      a: 'Exam cards are dispenses from the Dean of Students office inside the Administration Block after completing academic clearances at the cashier counter.'
    },
    {
      q: 'Who can access the computer labs?',
      a: 'The computing complexes inside the Sci & ICT Labs are free to access for all IT/CS undergraduates during working weekdays from 8:00 AM to 5:00 PM.'
    },
    {
      q: 'Where do I submit graduation clearances?',
      a: 'Graduation clearances are handled through your official Student Portal. After logging your details, submit physically signed forms to the Administration Block registrars.'
    }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setTicketLogged(true);
    setSupportMessage('');
    setTimeout(() => {
      setTicketLogged(false);
    }, 4500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT MODULE: CONTROLS & APPEARANCES (7 Columns) */}
      <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-6">
        
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">System settings</span>
          <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">Application Options</h3>
        </div>

        {/* 1. APPEARANCE COMPONENT */}
        <div id="settings-appearance-card" className="p-4 bg-slate-50 dark:bg-slate-850/45 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Appearance Theme</span>
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 block">Dark Visual Mode</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block">Reduce screen eyestrain in university classrooms during late night semesters.</span>
            </div>
            
            <button
              id="settings-darkmode-toggle"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-3 H-3 text-blue-600" /> : <Sun className="w-3 H-3 text-amber-500" />}
              </span>
            </button>
          </div>
        </div>

        {/* 2. NOTIFICATIONS TOGGLES */}
        <div id="settings-notifications" className="p-4 bg-slate-50 dark:bg-slate-850/45 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Notification Preferences</span>
          
          {/* Switch A */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="space-y-0.5 pr-4">
              <span className="font-bold text-slate-875 dark:text-slate-100 block">In-App Notifications</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block">Receive popups and badges in the top bar bell of CampusEcho.</span>
            </div>
            <button
              id="toggle-in-app-notif"
              onClick={() => setInAppNotif(!inAppNotif)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                inAppNotif ? 'bg-blue-600' : 'bg-slate-250 dark:bg-slate-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadowRef transition duration-200 ${inAppNotif ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Switch B */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="space-y-0.5 pr-4">
              <span className="font-bold text-slate-875 dark:text-slate-100 block">Email Academic Alerts</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block">Receive catalog schedules directly in your official student mailbox.</span>
            </div>
            <button
              id="toggle-email-notif"
              onClick={() => setEmailNotif(!emailNotif)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                emailNotif ? 'bg-blue-600' : 'bg-slate-250 dark:bg-slate-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* 3. PLATFORM VERSION & METRICS COMPONENT */}
        <div id="settings-about" className="p-4 bg-slate-50 dark:bg-slate-850/45 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 font-sans">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">About CampusEcho</span>
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p>• <strong className="text-slate-705 dark:text-slate-200">System Name:</strong> CampusEcho Smart Companion</p>
            <p>• <strong className="text-slate-705 dark:text-slate-200">Current Release:</strong> Phase 1.0.0 (Frontend Solution)</p>
            <p>• <strong className="text-slate-705 dark:text-slate-200">Target Frameworks:</strong> React 19 + Tailwind v4 + Vite + ESNext</p>
            <p>• <strong className="text-slate-705 dark:text-slate-200">Inbound Clearance API:</strong> Simulated State Connector active</p>
          </div>
        </div>

      </section>

      {/* RIGHT MODULE: FAQs & CUSTOMER DESK SUPPORT (5 Columns) */}
      <section className="lg:col-span-5 space-y-6">
        
        {/* HELP CENTER ACCORDIONS (MANDATORY) */}
        <div id="help-center-widget" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-805 pb-3">
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 flex items-center mb-0.5">
              <HelpCircle className="w-4.5 h-4.5 text-blue-500 mr-1.5 shrink-0" />
              <span>Academic FAQ Portal</span>
            </h4>
          </div>

          <div id="faq-accordions" className="space-y-2.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors hover:bg-slate-100/40 dark:hover:bg-slate-800/20 focus:outline-hidden"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOMER DESK SUPPORT FORM (MANDATORY) */}
        <div id="support-desk-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center">
            <PhoneCall className="w-4.5 h-4.5 text-emerald-500 mr-1.5 shrink-0" />
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Contact Support Desk</h4>
          </div>

          {ticketLogged && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-start space-x-1.5 animate-bounce">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>Ticket logged successfully! Our IT officers will contact you via email shortly.</span>
            </div>
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-405 uppercase tracking-wider block">Category Ticket Type</label>
              <select 
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-transparent focus:bg-white"
              >
                <option>Technical Support</option>
                <option>Timetable Overlap/Rescheduling</option>
                <option>Examination Clearances</option>
                <option>Cafeteria Services</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-405 uppercase tracking-wider block">Support Message Details</label>
              <textarea
                required
                rows={3}
                placeholder="Describe your technical difficulty or timetable issues..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-transparent focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-hidden"
            >
              Submit Support Ticket
            </button>
          </form>

        </div>

      </section>

    </div>
  );
}
