'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, token } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('admin@doctortracker.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const fillDemoCredentials = () => {
    setEmail('admin@doctortracker.com');
    setPassword('Admin@123456');
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
    <div className="min-h-screen flex flex-col justify-between px-4 py-8 sm:py-12 bg-slate-50 selection:bg-teal-100 selection:text-teal-900 font-sans">
      {/* Subtle Top Brand Anchor */}
      <header className="w-full max-w-sm sm:max-w-md mx-auto pt-2 sm:pt-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-900/10">
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
          <span className="font-headline font-bold text-xl tracking-tight text-slate-900">
            Doctor Tracker
          </span>
        </div>
      </header>

      {/* Main Centered Authentication Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
          {/* Heading & Context */}
          <div className="text-left mb-7">
            <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-normal">
              Enter your credentials to access the Doctor Tracker portal.
            </p>
          </div>

          {/* Quick Test Fill Hint (Only Admin Account) */}
          <button
            type="button"
            onClick={fillDemoCredentials}
            title="Click to automatically fill admin credentials"
            className="w-full text-left mb-6 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span className="font-medium text-slate-700">Demo Admin:</span>
              <span className="font-mono text-slate-600">
                admin@doctortracker.com
              </span>
            </div>
            <span className="text-xs text-teal-700 font-medium group-hover:underline flex items-center gap-0.5">
              Auto-fill
            </span>
          </button>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="workEmail"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="workEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors shadow-none"
                />
              </div>
            </div>

            {/* Password Input with Forgot Link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#forgot-password"
                  className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors shadow-none"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  Remember this device for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-1 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Supplementary Support Note */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          Protected by healthcare compliance standards.
          <br />
          Need access or trouble logging in?{' '}
          <a
            className="text-slate-700 font-medium hover:underline"
            href="mailto:support@doctortracker.io"
          >
            Contact hospital IT support
          </a>
          .
        </p>
      </main>

      {/* Clean, Understated Footer */}
      <footer className="w-full max-w-xl mx-auto pt-4 pb-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-500">
          <a href="#privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </a>
          <span className="text-slate-300">•</span>
          <a href="#terms" className="hover:text-slate-800 transition-colors">
            Terms of Service
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="#status"
            className="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>System Status</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
