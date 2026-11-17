import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export interface BadgeStyle {
  /** Full pill class string — bg + text + border */
  pill: string;
  /** Small dot indicator class */
  dot: string;
  /** Material Symbol icon name */
  icon: string;
  /** Accessible label */
  label: string;
}

export function getConditionBadge(condition: string): BadgeStyle {
  const c = (condition || '').toLowerCase();
  if (c.includes('critical') || c.includes('acute') || c.includes('cardiac') || c.includes('stroke')) {
    return {
      pill: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-300/40',
      dot: 'bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]',
      icon: 'emergency',
      label: condition,
    };
  }
  if (c.includes('observation') || c.includes('monitoring') || c.includes('post-op') || c.includes('arrhythmia')) {
    return {
      pill: 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-300/40',
      dot: 'bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]',
      icon: 'monitor_heart',
      label: condition,
    };
  }
  if (c.includes('stable') || c.includes('routine') || c.includes('hypertension') || c.includes('mild')) {
    return {
      pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-300/40',
      dot: 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]',
      icon: 'check_circle',
      label: condition,
    };
  }
  if (c.includes('recovered') || c.includes('discharged')) {
    return {
      pill: 'bg-sky-50 text-sky-700 border border-sky-200 ring-1 ring-sky-300/40',
      dot: 'bg-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]',
      icon: 'task_alt',
      label: condition,
    };
  }
  return {
    pill: 'bg-surface-container text-on-surface-variant border border-outline-variant/40',
    dot: 'bg-outline',
    icon: 'info',
    label: condition,
  };
}

/** @deprecated use getConditionBadge — kept for backward compat */
export function getConditionBadgeClass(condition: string): { bg: string; text: string; dot: string } {
  const b = getConditionBadge(condition);
  return { bg: b.pill, text: b.pill, dot: b.dot };
}

export function getDoctorStatusBadgeClass(status: string): { bg: string; text: string; dot: string } {
  const s = (status || '').toLowerCase().trim();
  if (s === 'active') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-300/40',
      text: 'text-emerald-700 font-semibold',
      dot: 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]',
    };
  }
  if (s === 'on-leave' || s === 'on leave') {
    return {
      bg: 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-300/40',
      text: 'text-amber-700 font-semibold',
      dot: 'bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]',
    };
  }
  // inactive / unknown
  return {
    bg: 'bg-surface-container text-outline border border-outline-variant/40',
    text: 'text-outline font-semibold',
    dot: 'bg-outline',
  };
}

/** Returns a human-readable label for a doctor status value from the DB. */
export function formatDoctorStatus(status: string): string {
  const s = (status || '').toLowerCase().trim();
  if (s === 'active') return 'Active';
  if (s === 'on-leave' || s === 'on leave') return 'On Leave';
  return status || 'Unknown';
}
