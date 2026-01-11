"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type AQIHistoryPoint = {
  time: string;
  pm25: number;
};

export default function AQIChart({ data }: { data: AQIHistoryPoint[] }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, "dataMax + 10"]} />
          <Tooltip />

          {/* AQI Thresholds */}
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
          <ReferenceLine y={60} stroke="#eab308" strokeDasharray="3 3" />
          <ReferenceLine y={90} stroke="#dc2626" strokeDasharray="3 3" />

          <Line
            type="monotone"
            dataKey="pm25"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
