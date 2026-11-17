"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: "grid_view" },
  { name: "Doctors", href: "/doctors", icon: "stethoscope" },
  { name: "Patients", href: "/patients", icon: "vital_signs" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Top Header / Brand */}
        <div className="flex flex-col flex-1">
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-outline-variant/30">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined">stethoscope</span>
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

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              title="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
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
                    onClick={() => onClose?.()}
                    className={cn(
                      "flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all text-sm font-medium",
                      active
                        ? "bg-teal-700 text-white font-bold shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px]",
                        active ? "text-white" : "text-outline",
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
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[11px] text-outline truncate capitalize">
                  {user?.role || "Super Admin"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign out of portal"
              className="p-1.5 text-outline hover:text-error hover:bg-error-container/30 rounded-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out of Portal"
        message="Are you sure you want to log out of the Doctor Tracker clinical administration console? Your active session will be ended."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
