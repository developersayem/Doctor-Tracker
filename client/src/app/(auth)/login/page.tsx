'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, token } = useAuth();
  const router = useRouter();

  const [domain, setDomain] = useState('metrohealth.org');
  const [email, setEmail] = useState('admin@doctortracker.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleFillCredentials = (
    demoDomain: string,
    demoEmail: string,
    demoPass: string
  ) => {
    setDomain(demoDomain);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex items-center justify-center p-4 sm:p-8">
      <main className="w-full max-w-6xl mx-auto flex flex-col">
        {/* Top Security Status Bar */}
        <div className="flex items-center justify-between px-space-md py-space-xs mb-space-sm bg-surface-container-low rounded-xl text-on-surface-variant font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="uppercase tracking-wider text-primary font-semibold text-[11px]">
              St. Jude Medical Center • Secure Clinical Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-outline text-[11px]">
              Hospital Gateway Online
            </span>
            <span className="inline-flex items-center gap-1 text-primary text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px]">
                verified_user
              </span>
              <span>HIPAA Vault Online</span>
            </span>
          </div>
        </div>

        {/* Main Authentication Bento Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-outline-variant/30">
          {/* Left Column / Clinical Branding & Assurance Rail (5 Cols) */}
          <div className="lg:col-span-5 relative bg-inverse-surface text-inverse-on-surface p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Glowing Teal Ambient Backdrops */}
            <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-primary opacity-25 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-secondary-container opacity-20 blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-inverse-surface/40 to-inverse-surface pointer-events-none"></div>

            <div className="relative z-10 flex flex-col">
              {/* Logo & Brand Header */}
              <div className="flex items-center gap-3.5 mb-10">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    local_hospital
                  </span>
                </div>
                <div>
                  <span className="font-headline text-2xl font-bold tracking-tight text-white block leading-none">
                    Doctor Tracker
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-tertiary-fixed-dim font-semibold mt-1 block">
                    Clinical Enterprise OS
                  </span>
                </div>
              </div>

              {/* Main Brand Lead Headline */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 bg-primary/25 border border-primary/40 px-3 py-1 rounded-full text-tertiary-fixed font-mono text-[11px] uppercase tracking-wider mb-4">
                  <span className="material-symbols-outlined text-[13px]">
                    shield
                  </span>
                  Admin Authorization Gate
                </div>
                <h1 className="font-headline text-2xl sm:text-3xl text-white font-bold leading-tight tracking-tight">
                  Enterprise Clinical & Physician Management
                </h1>
                <p className="mt-3 text-inverse-on-surface/80 text-sm leading-relaxed">
                  Precision administrative controls governing multi-facility
                  staffing, live patient allocations, and high-velocity hospital
                  telemetry.
                </p>
              </div>

              {/* Compliance Badges */}
              <div className="space-y-3 my-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-highest/10 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center shrink-0 text-tertiary-fixed">
                    <span className="material-symbols-outlined text-[18px]">
                      verified
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Role-Based Access Control (RBAC)
                    </div>
                    <div className="text-[11px] text-inverse-on-surface/70">
                      JWT validation with instantaneous privilege revoking
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-highest/10 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 text-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">
                      policy
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      HIPAA & Hospital Data Compliance
                    </div>
                    <div className="text-[11px] text-inverse-on-surface/70">
                      Full SOC2 Type II audit logging across registries
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-highest/10 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/30 flex items-center justify-center shrink-0 text-tertiary-fixed">
                    <span className="material-symbols-outlined text-[18px]">
                      sync
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Real-Time Clinical Records
                    </div>
                    <div className="text-[11px] text-inverse-on-surface/70">
                      Immediate synchronization across surgical departments
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge Footer */}
            <div className="relative z-10 mt-8 pt-4 bg-surface-container-highest/10 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary-fixed text-[18px]">
                  lock
                </span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary-fixed">
                  Active Defense Shield
                </span>
              </div>
              <p className="text-[11px] text-inverse-on-surface/80 italic leading-snug">
                Protected by 256-bit TLS Encryption & Multi-Factor Auth. All
                cryptographic sessions are rotated per clinical protocol.
              </p>
            </div>
          </div>

          {/* Right Column / Sign In Form Interface (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Header and Welcome */}
              <div className="flex items-start justify-between pb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <span className="material-symbols-outlined text-[18px]">
                      local_hospital
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                      Clinical Station Verification
                    </span>
                  </div>
                  <h2 className="font-headline text-2xl text-on-surface font-bold tracking-tight">
                    Sign in to Doctor Tracker Admin
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Enter your medical administrative credentials to access
                    doctor and patient registries.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="px-2.5 py-1 bg-surface-container text-on-surface font-mono text-xs rounded-md font-semibold">
                    PORTAL v4.18
                  </span>
                  <span className="font-mono text-[11px] text-outline mt-1">
                    St. Jude Medical Group
                  </span>
                </div>
              </div>

              {/* Fast-Fill Test Profiles */}
              <div className="mb-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
                    Test Administrative Profiles
                  </span>
                  <span className="text-xs text-primary flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">
                      touch_app
                    </span>
                    Click to autofill
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleFillCredentials(
                        'metrohealth.org',
                        'admin@doctortracker.com',
                        'Admin@123456'
                      )
                    }
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface text-xs shadow-sm border border-outline-variant/30 transition-all hover:-translate-y-0.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-semibold text-primary">
                      Super Admin:
                    </span>
                    <span className="font-mono text-on-surface-variant">
                      admin@doctortracker.com
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleFillCredentials(
                        'stjude.org',
                        'director@stjude.org',
                        'Admin@123456'
                      )
                    }
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface text-xs shadow-sm border border-outline-variant/30 transition-all hover:-translate-y-0.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-semibold text-secondary">
                      Medical Director:
                    </span>
                    <span className="font-mono text-on-surface-variant">
                      director@stjude.org
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Facility Domain */}
                <div>
                  <label
                    htmlFor="domain"
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                  >
                    Facility / Organization Domain
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                      domain
                    </span>
                    <input
                      id="domain"
                      type="text"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="hospital.domain.org"
                      className="w-full h-11 pl-10 pr-20 bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <span className="absolute right-3 font-mono text-[11px] text-outline bg-surface-container px-1.5 py-0.5 rounded">
                      ORG-ID
                    </span>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                  >
                    Work Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                      badge
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@doctortracker.com"
                      className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-on-surface"
                    >
                      Master Security Password
                    </label>
                    <a
                      href="#help"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Reset Token?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="text-xs text-on-surface-variant">
                      Remember this workstation for 30 days
                    </span>
                  </label>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-outline">
                    <span className="material-symbols-outlined text-[14px]">
                      desktop_windows
                    </span>
                    <span>WS-9021</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary hover:bg-primary-container active:bg-on-primary-fixed-variant text-white font-headline text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying JWT & Token Matrix...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">
                          login
                        </span>
                        <span>Sign In to Portal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* MFA Helper Note */}
              <div className="mt-4 p-3 rounded-lg bg-surface-container-high/40 flex items-center gap-2.5 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                  vpn_key
                </span>
                <span>
                  Hardware FIDO2 Keys and Authenticator tokens will prompt
                  immediately upon facility domain verification.
                </span>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-outline text-xs gap-2 border-t border-outline-variant/30">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-error">
                  gavel
                </span>
                <span>Authorized clinical personnel only. Access is monitored.</span>
              </div>
              <div className="flex items-center gap-3">
                <a href="#audit" className="hover:text-on-surface transition-colors">
                  Audit Policy
                </a>
                <span>•</span>
                <a href="#privacy" className="hover:text-on-surface transition-colors">
                  HIPAA Protocol
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
