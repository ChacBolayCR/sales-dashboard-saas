"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "01 Jun", sales: 1200 },
  { date: "05 Jun", sales: 2100 },
  { date: "10 Jun", sales: 1800 },
  { date: "15 Jun", sales: 2600 },
  { date: "20 Jun", sales: 2300 },
  { date: "25 Jun", sales: 3100 },
];

export default function SalesChart({ data }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Ventas en el tiempo
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#143061ff" />
            <YAxis stroke="#112952ff" />
            <Tooltip labelStyle={{ color: "#143061ff" }} />
            <legend style={{ color: "#143061ff" }} />
            <Line 
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
