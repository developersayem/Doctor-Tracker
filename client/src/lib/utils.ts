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

export function getConditionBadgeClass(condition: string): { bg: string; text: string; dot: string } {
  const c = condition.toLowerCase();
  if (c.includes('critical') || c.includes('cardiac arrest') || c.includes('stroke') || c.includes('acute')) {
    return {
      bg: 'bg-red-50 text-error border border-red-200',
      text: 'text-error font-semibold',
      dot: 'bg-error',
    };
  }
  if (c.includes('stable') || c.includes('routine') || c.includes('hypertension') || c.includes('mild')) {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      text: 'text-emerald-700 font-semibold',
      dot: 'bg-emerald-500',
    };
  }
  if (c.includes('observation') || c.includes('monitoring') || c.includes('post-op') || c.includes('arrhythmia')) {
    return {
      bg: 'bg-amber-50 text-amber-800 border border-amber-200',
      text: 'text-amber-700 font-semibold',
      dot: 'bg-amber-500',
    };
  }
  if (c.includes('recovered') || c.includes('discharged')) {
    return {
      bg: 'bg-blue-50 text-blue-800 border border-blue-200',
      text: 'text-blue-700 font-semibold',
      dot: 'bg-blue-500',
    };
  }
  return {
    bg: 'bg-surface-container text-on-surface-variant border border-outline-variant/40',
    text: 'text-on-surface-variant font-medium',
    dot: 'bg-outline',
  };
}

export function getDoctorStatusBadgeClass(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-primary/10 text-primary border border-primary/20',
        text: 'text-primary font-semibold',
        dot: 'bg-primary',
      };
    case 'On Leave':
      return {
        bg: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'text-amber-700 font-semibold',
        dot: 'bg-amber-500',
      };
    case 'Inactive':
    default:
      return {
        bg: 'bg-surface-container text-outline border border-outline-variant/40',
        text: 'text-outline font-semibold',
        dot: 'bg-outline',
      };
  }
}
