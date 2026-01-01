"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"

const data = [
  { month: "February", value: 30 },
  { month: "March", value: 40 },
  { month: "April", value: 50 },
  { month: "May", value: 45 },
  { month: "June", value: 55 },
  { month: "July", value: 75 },
  { month: "August", value: 75 },
  { month: "September", value: 85 },
]

export function HealthChart() {
  return (
    <div className="h-64 w-full mt-8 relative">
      <div className="absolute left-0 top-0 text-[10px] italic font-medium opacity-50">100%</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fontWeight: 500, fill: "var(--primary)" }}
            dy={20}
          />
          <Tooltip
            contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={false}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}