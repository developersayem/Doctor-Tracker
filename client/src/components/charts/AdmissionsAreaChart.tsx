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

const DEFAULT_TRENDS = [
  { date: 'Jan', admissions: 18 },
  { date: 'Feb', admissions: 24 },
  { date: 'Mar', admissions: 21 },
  { date: 'Apr', admissions: 35 },
  { date: 'May', admissions: 30 },
  { date: 'Jun', admissions: 44 },
  { date: 'Jul', admissions: 52 },
  { date: 'Aug', admissions: 48 },
  { date: 'Sep', admissions: 61 },
  { date: 'Oct', admissions: 57 },
  { date: 'Nov', admissions: 68 },
  { date: 'Dec', admissions: 74 },
];

export default function AdmissionsAreaChart({ data }: AdmissionsAreaChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_TRENDS;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
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
