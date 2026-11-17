'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { AnalyticsData, ApiResponse } from '@/types';
import { formatDate, getConditionBadgeClass } from '@/lib/utils';
import dynamic from 'next/dynamic';
import DoctorModal from '@/components/doctors/DoctorModal';

const AdmissionsAreaChart = dynamic(
  () => import('@/components/charts/AdmissionsAreaChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-outline text-xs">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-2"></div>
        <span>Rendering telemetry...</span>
      </div>
    ),
  }
);

const SPECIALTY_COLORS = [
  '#00685f', // primary teal
  '#006398', // secondary blue
  '#4fdbc8', // tertiary mint
  '#5bb8fe', // secondary light blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function DashboardPage() {
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: analyticsRes, isLoading, refetch } = useQuery<ApiResponse<AnalyticsData>>({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AnalyticsData>>('/analytics/dashboard');
      return res.data;
    },
    refetchInterval: 30000, // Live poll every 30 seconds
  });

  const analytics = analyticsRes?.data;
  const kpis = analytics?.kpis || {
    totalDoctors: 0,
    totalPatients: 0,
    avgPatientsPerDoctor: 0,
    criticalPatients: 0,
  };

  const totalDoctorsNum = Number(kpis.totalDoctors) || 0;
  const totalPatientsNum = Number(kpis.totalPatients) || 0;
  const avgPatientsNum = Number(kpis.avgPatientsPerDoctor) || 0;
  const criticalPatientsNum = Number(kpis.criticalPatients) || 0;

  const workload = analytics?.patientWorkload || [];
  const admissionTrends = analytics?.admissionTrends || [];
  const recentAssignments = analytics?.recentAssignments || [];

  // Format admission trend dates for chart
  const formattedTrends = admissionTrends.map((t) => ({
    date: t.date ? t.date.slice(5) : '',
    admissions: t.admissions,
  }));

  // Workload pie data
  const pieData = workload.map((w, idx) => ({
    name: w.specialization,
    value: w.patientCount || w.doctorCount || 1,
    percentage: w.percentage,
    color: SPECIALTY_COLORS[idx % SPECIALTY_COLORS.length],
  }));

  return (
    <div className="flex flex-col w-full p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Executive Control & Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-sans text-[10px] uppercase tracking-widest font-semibold">
              Live Operational Stream
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span className="font-sans text-[11px] text-outline/70 font-medium">
              Live Department Telemetry
            </span>
          </div>
          <h1 className="font-headline text-[1.75rem] sm:text-[2rem] font-extrabold text-on-surface tracking-tighter leading-[1.1]">
            Executive Clinical Intelligence &amp; Staffing Overview
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-2xl leading-relaxed">
            Continuous physician deployment, operational capacity metrics, and
            multi-department admission telemetry across Metro General Central facilities.
          </p>
        </div>

        {/* Quick Actions Ribbon */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            title="Refresh analytics data"
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDoctorModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            <span>Register Physician</span>
          </button>
        </div>
      </div>

      {/* Top Hero / KPI Metrics Row (4 bespoke cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Physician Roster */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Physician Roster
              </span>
              <div className="font-headline text-3xl font-bold text-on-surface mt-1">
                {isLoading ? '...' : totalDoctorsNum}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                stethoscope
              </span>
            </div>
          </div>

          <div className="my-3">
            <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
              <path
                className="text-primary"
                d="M0,18 Q15,16 30,20 T60,11 T85,14 T100,4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                className="text-primary/10"
                d="M0,18 Q15,16 30,20 T60,11 T85,14 T100,4 L100,24 L0,24 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container">
            <span className="inline-flex items-center gap-1 text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px]">
                trending_up
              </span>
              Active Physicians
            </span>
            <span className="text-outline font-mono">
              {workload.length} Specialties
            </span>
          </div>
        </div>

        {/* Card 2: Active Patient Census */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Active Census
              </span>
              <div className="font-headline text-3xl font-bold text-on-surface mt-1">
                {isLoading ? '...' : totalPatientsNum}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                vital_signs
              </span>
            </div>
          </div>

          <div className="my-3 flex items-center gap-2">
            <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (totalPatientsNum / 100) * 100)}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs text-on-surface font-semibold">
              {Math.min(100, Math.round((totalPatientsNum / 100) * 100))}% cap
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container">
            <span className="inline-flex items-center gap-1 text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">
                north_east
              </span>
              Real-time Inflow
            </span>
            <span className="text-outline font-mono">MRN Verified</span>
          </div>
        </div>

        {/* Card 3: Density Ratio */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Density Ratio
              </span>
              <div className="font-headline text-3xl font-bold text-on-surface mt-1">
                {isLoading ? '...' : avgPatientsNum}
                <span className="text-base font-normal text-outline ml-1">/doc</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                density_medium
              </span>
            </div>
          </div>

          <div className="my-3">
            <div className="flex justify-between font-mono text-[11px] text-outline mb-1">
              <span>0</span>
              <span className="text-primary font-semibold">Target &lt; 15</span>
              <span>25 Max</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (avgPatientsNum / 25) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container">
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Safe Clinical Zone
            </span>
            <span className="text-outline font-mono">Balanced</span>
          </div>
        </div>

        {/* Card 4: Critical Attention Cases */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Critical Priority
              </span>
              <div className="font-headline text-3xl font-bold text-error mt-1">
                {isLoading ? '...' : criticalPatientsNum}
                <span className="text-base font-normal text-outline ml-1">cases</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error group-hover:bg-error group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                warning
              </span>
            </div>
          </div>

          <div className="my-3 flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline font-medium">
                Immediate Attention
              </span>
              <span className="font-headline text-sm text-error font-bold">
                ICU & Critical Care
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[11px] text-outline font-medium">Protocol</span>
              <span className="text-xs text-primary font-semibold">Monitored</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container">
            <span className="text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                emergency
              </span>
              High Alert
            </span>
            <span className="text-outline font-mono">Continuous Telemetry</span>
          </div>
        </div>
      </div>

      {/* Interactive Analytics Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Admissions & Encounter Velocity (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Patient Admissions & Encounter Velocity
              </h2>
              <span className="text-xs text-outline">
                Longitudinal clinical intake volume by date
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
              {(['7D', '30D', '90D', '1Y'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTimeRange(tab)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    timeRange === tab
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Department Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary"></span>
              <span className="text-on-surface font-medium">Daily Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-secondary"></span>
              <span className="text-on-surface font-medium">Staffing Target</span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full pt-2">
            <AdmissionsAreaChart data={formattedTrends} />
          </div>

          {/* Analytical Sub-Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-container">
            <div className="p-3 rounded-xl bg-surface-container-low">
              <div className="text-[11px] text-outline font-medium">Mean Wait Interval</div>
              <div className="font-headline text-base font-bold text-on-surface mt-0.5">
                14.2 min
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <div className="text-[11px] text-outline font-medium">Readmission Rate</div>
              <div className="font-headline text-base font-bold text-primary mt-0.5">
                3.1%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <div className="text-[11px] text-outline font-medium">Discharge Velocity</div>
              <div className="font-headline text-base font-bold text-secondary mt-0.5">
                92.8%
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physician Workload Allocation (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Physician Workload Allocation
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-mono text-xs font-semibold">
                5 Core Depts
              </span>
            </div>
            <span className="text-xs text-outline block mt-0.5">
              Patient load balancing across medical units
            </span>
          </div>

          {/* Doughnut Chart & Summary Centerpiece */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Cardiology: 28% -> stroke-dasharray 74 190 */}
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="42"
                  stroke="#00685f"
                  strokeDasharray="74 190"
                  strokeDashoffset="0"
                  strokeWidth="16"
                />
                {/* Orthopedics: 22% -> stroke-dasharray 58 206 */}
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="42"
                  stroke="#006398"
                  strokeDasharray="58 206"
                  strokeDashoffset="-74"
                  strokeWidth="16"
                />
                {/* Pediatrics: 20% -> stroke-dasharray 53 211 */}
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="42"
                  stroke="#4fdbc8"
                  strokeDasharray="53 211"
                  strokeDashoffset="-132"
                  strokeWidth="16"
                />
                {/* Oncology: 15% -> stroke-dasharray 40 224 */}
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="42"
                  stroke="#5bb8fe"
                  strokeDasharray="40 224"
                  strokeDashoffset="-185"
                  strokeWidth="16"
                />
                {/* Neurology: 15% -> stroke-dasharray 39 225 */}
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="42"
                  stroke="#dae2fd"
                  strokeDasharray="39 225"
                  strokeDashoffset="-225"
                  strokeWidth="16"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-headline text-xl font-bold text-on-surface leading-none">
                  100%
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-outline mt-1 font-semibold">
                  ALLOCATION
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00685f] shrink-0"></div>
                <span className="text-xs text-on-surface truncate font-medium">
                  Cardiology (28%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#006398] shrink-0"></div>
                <span className="text-xs text-on-surface truncate font-medium">
                  Orthopedics (22%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4fdbc8] shrink-0"></div>
                <span className="text-xs text-on-surface truncate font-medium">
                  Pediatrics (20%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5bb8fe] shrink-0"></div>
                <span className="text-xs text-on-surface truncate font-medium">
                  Oncology (15%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#dae2fd] shrink-0"></div>
                <span className="text-xs text-on-surface truncate font-medium">
                  Neurology (15%)
                </span>
              </div>
            </div>
          </div>

          {/* Workload Breakdown Horizontal Bars with Staffing Ratios */}
          <div className="space-y-3 pt-3 border-t border-surface-container">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">
                  Cardiology Wing A
                </span>
                <span className="font-mono text-primary font-bold">
                  1:24 Ratio
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-[#00685f] h-full rounded-full"
                  style={{ width: '82%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">
                  Orthopedic Surgery
                </span>
                <span className="font-mono text-secondary font-bold">
                  1:18 Ratio
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-[#006398] h-full rounded-full"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">
                  Pediatrics Complex
                </span>
                <span className="font-mono text-[#00685d] font-bold">
                  1:21 Ratio
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-[#4fdbc8] h-full rounded-full"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Directive Link */}
          <div className="pt-2">
            <Link
              href="/doctors"
              className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-outline-variant/30"
            >
              <span>Rebalance Clinical Rosters</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Tabular Activity Feed */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Recent Doctor & Patient Assignment Activity
            </h2>
            <span className="text-xs text-outline">
              Real-time encounter stream and clinical status changes
            </span>
          </div>
          <Link
            href="/patients"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Patients</span>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-mono text-outline uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Attending Physician</th>
                <th className="py-3 px-4">Specialty / Unit</th>
                <th className="py-3 px-4">Patient Intake</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {recentAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-outline text-xs">
                    No active assignments recorded yet. Use the action buttons above to register doctors and intake patients.
                  </td>
                </tr>
              ) : (
                recentAssignments.slice(0, 5).map((item) => {
                  const badge = getConditionBadgeClass(item.condition);
                  return (
                    <tr
                      key={item.patientId}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {item.doctorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface text-xs">
                              {item.doctorName}
                            </span>
                            <span className="font-mono text-[11px] text-outline">
                              Physician
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
                          {item.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-semibold text-xs">
                            {item.patientName}
                          </span>
                          <span className="font-mono text-[11px] text-outline">
                            ID: {item.patientId.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${badge.bg}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                          ></span>
                          <span>{item.condition}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-outline">
                        {formatDate(item.admissionDate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/doctors/${item.doctorId}`}
                          className="px-2.5 py-1 text-xs rounded-lg text-primary hover:bg-surface-container font-semibold inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Modal (Register Physician) */}
      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
