"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function StatusDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="relative h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#161616",
              border: "1px solid #3a3a3a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fafafa" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold tracking-tight">{total}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">total</div>
      </div>
    </div>
  );
}
