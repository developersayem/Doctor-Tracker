'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-space-xl">
      {/* Global Search Bar & Hospital Pill */}
      <div className="flex items-center gap-space-lg flex-1 max-w-2xl">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-4 bg-surface-container-low/50 border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low/60 rounded-lg border border-outline-variant/30 text-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">
            domain
          </span>
          <span className="text-on-surface font-medium truncate">
            {user?.hospital || 'Metro General Hospital - Central'}
          </span>
        </div>
      </div>

      {/* Right Action Icons & Profile Info */}
      <div className="flex items-center gap-space-md">
        {/* Quick link to API Docs */}
        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-outline hover:text-primary hover:bg-surface-container transition-colors"
          title="Open interactive OpenAPI Swagger Docs"
        >
          <span className="material-symbols-outlined text-[16px]">
            api
          </span>
          <span>API Docs</span>
        </a>

        {/* Live Notification Indicator */}
        <div className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] leading-tight rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </div>

        <div className="h-6 w-px bg-outline-variant/40 mx-1"></div>

        {/* User Card */}
        <div className="flex items-center gap-space-sm pl-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-on-surface">
              {user?.name || 'Dr. Sarah Adewale'}
            </span>
            <span className="text-[11px] text-outline capitalize">
              {user?.role || 'Chief Medical Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
