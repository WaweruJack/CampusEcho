import { X } from 'lucide-react';

export default function PolicyModal({ open, type, onClose }) {
  if (!open) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 id="policy-modal-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isPrivacy ? 'CampusEcho Privacy Policy' : 'CampusEcho Terms and Conditions'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                CampusEcho processes student and lecturer academic records solely to deliver university timetable coordination, classroom venue notifications, campus navigation, and EchoBot assistance for Meru University of Science and Technology (MUST).
              </p>
              <h3 className="font-semibold text-slate-900 dark:text-white">1. Data Collected</h3>
              <p>
                Registration collects your full name, MUST registration or staff number, official institutional email address (@students.must.ac.ke or @must.ac.ke), programme or department, and optional phone number for SMS class alerts.
              </p>
              <h3 className="font-semibold text-slate-900 dark:text-white">2. Access & Security</h3>
              <p>
                Row Level Security (RLS) isolates personal notification preferences, notification history, and EchoBot conversations to your authenticated account. API keys remain strictly on the server.
              </p>
            </>
          ) : (
            <>
              <p>
                By registering for CampusEcho, you confirm that you are a current student, lecturer, or authorized staff member of Meru University of Science and Technology (MUST).
              </p>
              <h3 className="font-semibold text-slate-900 dark:text-white">1. Account Eligibility & Roles</h3>
              <p>
                Student accounts require a valid @students.must.ac.ke address. Lecturer publishing and venue scheduling privileges are restricted to verified faculty accounts approved by the university administration.
              </p>
              <h3 className="font-semibold text-slate-900 dark:text-white">2. Acceptable Academic Use</h3>
              <p>
                Timetable updates, Digital Notice Board posts, and EchoBot queries must be used responsibly in accordance with MUST ICT and Academic Conduct policies.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
