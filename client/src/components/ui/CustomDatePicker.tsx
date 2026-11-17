'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

export interface CustomDatePickerProps {
  label?: string;
  required?: boolean;
  value: string; // Expected format: 'YYYY-MM-DD' or ISO string
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
  label,
  required,
  value,
  onChange,
  placeholder = 'Select date...',
  minDate,
  maxDate,
  disabled = false,
  error,
  helperText,
  className,
  id,
}: CustomDatePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date
  const parseDate = (val?: string): Date | null => {
    if (!val) return null;
    const parts = val.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate(value);

  // Month and Year state for browsing
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  // Keep view aligned if value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setViewYear(y);
    setViewMonth(today.getMonth());
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Generate calendar grid matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Days array
  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentMonthDays.push(d);
  }

  const remainingSlots = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let d = 1; d <= (remainingSlots < 7 ? remainingSlots : remainingSlots - 7); d++) {
    nextMonthDays.push(d);
  }

  // Format display text
  const formatDisplay = (d: Date | null): string => {
    if (!d) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-on-surface mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        id={inputId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full h-10 px-3 bg-surface-container-lowest border rounded-lg text-sm text-on-surface flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left',
          error
            ? 'border-error ring-1 ring-error/20'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-outline-variant/50 hover:border-primary/50',
          disabled && 'opacity-60 cursor-not-allowed bg-surface-container-low'
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
            calendar_today
          </span>
          <span
            className={cn(
              'truncate font-medium',
              selectedDate ? 'text-on-surface' : 'text-outline'
            )}
          >
            {selectedDate ? formatDisplay(selectedDate) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedDate && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 text-outline hover:text-on-surface rounded transition-colors"
              title="Clear date"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </span>
          )}
          <span className="material-symbols-outlined text-outline text-[18px]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150 select-none">
          {/* Calendar Header: Month, Year, and Nav Buttons */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 font-headline font-bold text-sm text-on-surface">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <span className="text-outline font-semibold">{viewYear}</span>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Previous month"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Next month"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_LABELS.map((d) => (
              <span
                key={d}
                className="font-mono text-[11px] font-semibold text-outline py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Trailing days from previous month */}
            {prevMonthDays.map((d) => (
              <span
                key={`prev-${d}`}
                className="h-8 flex items-center justify-center text-xs text-outline/30 font-medium rounded-lg select-none"
              >
                {d}
              </span>
            ))}

            {/* Current Month Days */}
            {currentMonthDays.map((d) => {
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === d;

              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={cn(
                    'h-8 w-full flex items-center justify-center text-xs font-semibold rounded-lg transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : isToday
                      ? 'border border-primary text-primary font-bold hover:bg-primary/10'
                      : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                  )}
                >
                  {d}
                </button>
              );
            })}

            {/* Leading days from next month */}
            {nextMonthDays.map((d) => (
              <span
                key={`next-${d}`}
                className="h-8 flex items-center justify-center text-xs text-outline/30 font-medium rounded-lg select-none"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30 px-1 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-outline hover:text-error font-medium transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-primary font-bold hover:underline transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-outline mt-1">{helperText}</p>
      )}
    </div>
  );
}
