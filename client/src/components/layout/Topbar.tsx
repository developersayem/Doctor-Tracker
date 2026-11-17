'use client';

import React from 'react';

interface TopbarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

export default function Topbar({
  onSearchChange,
  searchValue = '',
  searchPlaceholder = 'Search doctors, patients, MRN, specialty... ⌘K',
}: TopbarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-30 flex items-center justify-between px-space-xl">
      {/* Global Search Bar */}
      <div className="flex items-center gap-space-lg flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-4 bg-surface-container-low/50 border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
      </div>

      {/* Right Notifications */}
      <div className="flex items-center gap-3">
        <div className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </div>
      </div>
    </header>
  );
}
