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
  { name: 'Doctors Directory', href: '/doctors', icon: 'stethoscope' },
  { name: 'Patients Registry', href: '/patients', icon: 'vital_signs' },
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
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              local_hospital
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-headline-sm text-on-surface truncate leading-tight">
              Doctor Tracker
            </span>
            <span className="font-mono text-[11px] text-primary tracking-wider uppercase font-bold">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-space-md py-space-lg">
          <div className="px-space-sm mb-space-xs font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
            Clinical Registry
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
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
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

        {/* Clinical Environment Telemetry */}
        <div className="mx-space-md mt-auto mb-4 p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
          <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span>Live Node Connected</span>
          </div>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            St. Jude & Metro Health Systems synced with 256-bit HIPAA compliance.
          </p>
        </div>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
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
