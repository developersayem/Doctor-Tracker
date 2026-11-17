'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: 'grid_view' },
  { name: 'Doctors', href: '/doctors', icon: 'stethoscope' },
  { name: 'Patients', href: '/patients', icon: 'vital_signs' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      {/* Top Header / Brand */}
      <div className="flex flex-col flex-1">
        <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-outline-variant/30">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4.5v15m7.5-7.5h-15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-base text-slate-900 truncate leading-tight">
              Doctor Tracker
            </span>
            <span className="font-mono text-[11px] text-teal-700 tracking-wider uppercase font-bold">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-space-md py-space-lg">
          <div className="px-space-sm mb-space-xs font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
            NAVIGATION
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all text-sm font-medium',
                    active
                      ? 'bg-teal-700 text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  )}
                >
                  <span
                    className={cn(
                      'material-symbols-outlined text-[20px]',
                      active ? 'text-white' : 'text-outline'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-600/10 border border-teal-600/20 flex items-center justify-center text-teal-700 font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[11px] text-outline truncate capitalize">
                {user?.role || 'Super Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out of portal"
            className="p-1.5 text-outline hover:text-error hover:bg-error-container/30 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
