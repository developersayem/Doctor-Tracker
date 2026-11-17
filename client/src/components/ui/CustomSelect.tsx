'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  statusDot?: 'active' | 'leave' | 'inactive' | 'critical' | 'stable' | 'observation';
}

export interface CustomSelectProps {
  label?: string;
  required?: boolean;
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

export default function CustomSelect({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  icon,
  searchable = false,
  className,
  buttonClassName,
  disabled = false,
  error,
  helperText,
  id,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options if searchable
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.description && opt.description.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const getStatusDotColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'leave':
        return 'bg-amber-500';
      case 'inactive':
        return 'bg-slate-400';
      case 'critical':
        return 'bg-rose-500';
      case 'stable':
        return 'bg-teal-500';
      case 'observation':
        return 'bg-sky-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-on-surface mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-10 px-3 bg-surface-container-lowest border rounded-lg text-sm text-on-surface flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left',
          error
            ? 'border-error ring-1 ring-error/20'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-outline-variant/50 hover:border-primary/50',
          disabled && 'opacity-60 cursor-not-allowed bg-surface-container-low',
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              {icon}
            </span>
          )}

          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.statusDot && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    getStatusDotColor(selectedOption.statusDot)
                  )}
                />
              )}
              {selectedOption.icon && !icon && (
                <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              <span className="truncate font-medium text-on-surface">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-outline truncate">{placeholder}</span>
          )}
        </div>

        <span
          className={cn(
            'material-symbols-outlined text-outline text-[18px] shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-primary'
          )}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-[60] animate-fade-in">
          {/* Optional Search Input */}
          {searchable && (
            <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low/30">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            className="p-1.5 max-h-56 overflow-y-auto space-y-1"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-outline">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer select-none transition-colors group',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.statusDot && (
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            getStatusDotColor(opt.statusDot)
                          )}
                        />
                      )}
                      {opt.icon && (
                        <span
                          className={cn(
                            'material-symbols-outlined text-[18px] shrink-0',
                            isSelected ? 'text-primary' : 'text-outline group-hover:text-on-surface'
                          )}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium leading-tight">
                          {opt.label}
                        </p>
                        {opt.description && (
                          <p className="text-[11px] text-outline truncate leading-tight mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold',
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-surface-container text-outline'
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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
