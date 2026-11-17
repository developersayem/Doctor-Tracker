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
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-outline text-xs">
        No admission trend records available
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
