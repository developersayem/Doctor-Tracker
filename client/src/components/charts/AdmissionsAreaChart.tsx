'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdmissionsAreaChartProps {
  data: Array<{ date: string; admissions: number }>;
}

export default function AdmissionsAreaChart({ data }: AdmissionsAreaChartProps) {
  const hasRealData = data && data.length > 0 && data.some((d) => d.admissions > 0);

  if (!hasRealData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline mb-2">
          <span className="material-symbols-outlined text-[22px]">show_chart</span>
        </div>
        <p className="text-xs font-semibold text-on-surface">No Patient Admissions Recorded</p>
        <p className="text-[11px] text-outline mt-0.5 max-w-[280px]">
          Daily encounter velocity will graph dynamically here as patients are admitted.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="admissionsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00685f" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00685f" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaedff" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#6d7a77"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#bcc9c6' }}
        />
        <YAxis
          stroke="#6d7a77"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#131b2e',
            borderRadius: '8px',
            border: 'none',
            color: '#ffffff',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#89f5e7', fontWeight: 600 }}
          formatter={(value: number) => [`${value} Patients`, 'Admissions']}
        />
        <Area
          type="monotone"
          dataKey="admissions"
          stroke="#00685f"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#admissionsGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
