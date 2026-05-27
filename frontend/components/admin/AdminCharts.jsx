"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "Jan", users: 18, jobs: 8, approvals: 4 },
  { month: "Feb", users: 28, jobs: 14, approvals: 9 },
  { month: "Mar", users: 44, jobs: 21, approvals: 13 },
  { month: "Apr", users: 58, jobs: 29, approvals: 18 },
  { month: "May", users: 76, jobs: 37, approvals: 26 },
  { month: "Jun", users: 95, jobs: 46, approvals: 34 }
];

function ChartCard({ title, children }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <h2 className="text-base font-black text-white">{title}</h2>
      <div className="mt-5 h-72">{children}</div>
    </article>
  );
}

export default function AdminCharts() {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Monthly users">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
            <Area dataKey="users" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.22} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Jobs posted">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
            <Bar dataKey="jobs" fill="#34d399" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Verification approvals">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
            <Line dataKey="approvals" stroke="#fbbf24" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
