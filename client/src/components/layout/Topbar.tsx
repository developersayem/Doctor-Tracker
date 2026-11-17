"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { Doctor, Patient, ApiResponse } from "@/types";
import {
  getConditionBadge,
  formatDoctorStatus,
  getDoctorStatusBadgeClass,
} from "@/lib/utils";

interface TopbarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({
  onSearchChange,
  searchValue = "",
  searchPlaceholder = "Search doctors, patients, specialty... ⌘K",
  onMenuToggle,
}: TopbarProps) {
  const router = useRouter();

  // Search state
  const [query, setQuery] = useState(searchValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal query if external searchValue changes
  useEffect(() => {
    if (searchValue !== undefined && searchValue !== query) {
      setQuery(searchValue);
    }
  }, [searchValue]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside to close search popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query fetching both doctors and patients
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDoctors([]);
      setPatients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [docRes, patRes] = await Promise.allSettled([
          apiClient.get<ApiResponse<Doctor[]>>(
            `/doctors?search=${encodeURIComponent(trimmed)}&limit=5`,
          ),
          apiClient.get<ApiResponse<Patient[]>>(
            `/patients?search=${encodeURIComponent(trimmed)}&limit=5`,
          ),
        ]);

        if (docRes.status === "fulfilled") {
          setDoctors(docRes.value.data.data || []);
        } else {
          setDoctors([]);
        }

        if (patRes.status === "fulfilled") {
          setPatients(patRes.value.data.data || []);
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    onSearchChange?.(val);
  };

  const handleSelectDoctor = (doc: Doctor) => {
    setIsOpen(false);
    router.push(`/doctors/${doc._id}`);
  };

  const handleSelectPatient = (patient: Patient) => {
    setIsOpen(false);
    router.push(`/patients?search=${encodeURIComponent(patient.name)}`);
  };

  const totalResults = doctors.length + patients.length;
  const hasQuery = query.trim().length > 0;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-30 flex items-center justify-between px-3 sm:px-6 lg:px-space-xl transition-all">
      {/* Mobile Hamburger Menu Toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden mr-2 p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center shrink-0"
        title="Open navigation menu"
        aria-label="Open navigation menu"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      {/* Global Multi-Entity Search Bar */}
      <div
        ref={searchContainerRef}
        className="relative flex items-center gap-space-lg flex-1 max-w-xl"
      >
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-14 bg-surface-container-low/50 border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />

          {/* Right indicator: spinner or ⌘K shortcut badge */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            ) : query ? (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="p-1 text-outline hover:text-on-surface rounded-md transition-colors"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-outline bg-surface-container border border-outline-variant/40 rounded">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            )}
          </div>
        </div>

        {/* Search Results Popover Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100 max-h-[75vh] flex flex-col">
            {/* Header info */}
            <div className="px-4 py-2.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30 text-[11px] font-mono text-outline">
              <span className="uppercase tracking-wider font-semibold">
                {hasQuery
                  ? `Results for "${query.trim()}"`
                  : "Quick Directory Search"}
              </span>
              <span>
                {hasQuery ? `${totalResults} matches` : "Doctors & Patients"}
              </span>
            </div>

            {/* Results Content */}
            <div className="overflow-y-auto divide-y divide-outline-variant/20">
              {isLoading && !hasQuery && (
                <div className="p-8 text-center text-xs text-outline flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span>Searching clinical database...</span>
                </div>
              )}

              {/* No query: show helpful search hints */}
              {!hasQuery && (
                <div className="p-4 space-y-3">
                  <p className="text-xs text-on-surface-variant">
                    Search across attending physicians, specialties, active
                    clinical census, and patient records.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-outline text-[11px] font-medium mr-1">
                      Suggestions:
                    </span>
                    {[
                      "Cardiology",
                      "Critical",
                      "Neurology",
                      "Dr. Sarah",
                      "Under Observation",
                    ].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleInputChange(term)}
                        className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 text-[11px] font-medium transition-colors border border-outline-variant/30"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results state */}
              {hasQuery && !isLoading && totalResults === 0 && (
                <div className="p-8 text-center space-y-2">
                  <span className="material-symbols-outlined text-outline text-[32px]">
                    search_off
                  </span>
                  <p className="text-sm font-semibold text-on-surface">
                    No records found
                  </p>
                  <p className="text-xs text-outline max-w-sm mx-auto">
                    No doctors or patients matched &quot;{query}&quot;. Check
                    the spelling or search by specialization or condition.
                  </p>
                </div>
              )}

              {/* Doctors Section */}
              {doctors.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-primary font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        stethoscope
                      </span>
                      Physicians ({doctors.length})
                    </span>
                    <Link
                      href={`/doctors?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] text-outline hover:text-primary transition-colors font-medium"
                    >
                      View all in Doctors →
                    </Link>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {doctors.map((doc) => {
                      const statusBadge = getDoctorStatusBadgeClass(doc.status);
                      return (
                        <button
                          key={doc._id}
                          type="button"
                          onClick={() => handleSelectDoctor(doc)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                              {doc.name
                                .replace(/^Dr\.\s*/i, "")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                                {doc.name}
                              </p>
                              <p className="text-[11px] text-outline truncate">
                                {doc.specialization} • {doc.contactNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                              ></span>
                              {formatDoctorStatus(doc.status)}
                            </span>
                            <span className="material-symbols-outlined text-outline text-[16px] group-hover:translate-x-0.5 transition-transform">
                              chevron_right
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Patients Section */}
              {patients.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-secondary font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        vital_signs
                      </span>
                      Patients ({patients.length})
                    </span>
                    <Link
                      href={`/patients?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] text-outline hover:text-secondary transition-colors font-medium"
                    >
                      View all in Patients →
                    </Link>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {patients.map((pat) => {
                      const badge = getConditionBadge(pat.condition);
                      const docName =
                        typeof pat.doctorId === "object" && pat.doctorId
                          ? (pat.doctorId as Doctor).name
                          : null;

                      return (
                        <button
                          key={pat._id}
                          type="button"
                          onClick={() => handleSelectPatient(pat)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                              {pat.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate group-hover:text-secondary transition-colors">
                                {pat.name}
                              </p>
                              <p className="text-[11px] text-outline truncate">
                                {pat.age} yrs • {pat.gender}{" "}
                                {docName ? `• Attending: ${docName}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${badge.pill}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                              ></span>
                              {pat.condition}
                            </span>
                            <span className="material-symbols-outlined text-outline text-[16px] group-hover:translate-x-0.5 transition-transform">
                              chevron_right
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between text-[11px] text-outline">
              <div className="flex items-center gap-2">
                <span>Select item to view</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-container rounded border border-outline-variant/40">
                  ESC
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
