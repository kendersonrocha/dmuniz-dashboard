"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from "recharts";

export function PipelineFunnel({ data }: { data: { stage: string; total: number; done: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 16, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="stage"
            tick={{ fill: "#a3a3a3", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#161616",
              border: "1px solid #3a3a3a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fafafa" }}
          />
          <Bar dataKey="total" fill="#3a3a3a" radius={[6, 6, 0, 0]} barSize={48}>
            <LabelList dataKey="total" position="top" fill="#fafafa" fontSize={14} fontWeight={700} />
          </Bar>
          <Bar dataKey="done" fill="#10b981" radius={[6, 6, 0, 0]} barSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
