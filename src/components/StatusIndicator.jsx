import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

const STATUS_STYLES = {
  scheduled: {
    label: 'Upcoming',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    icon: Clock,
  },
  rescheduled: {
    label: 'Rescheduled',
    textClass: 'text-amber-700 dark:text-amber-400',
    icon: AlertTriangle,
  },
  completed: {
    label: 'Completed',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    textClass: 'text-rose-700 dark:text-rose-400',
    icon: XCircle,
  },
};

export default function StatusIndicator({ status }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${cfg.textClass}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}
