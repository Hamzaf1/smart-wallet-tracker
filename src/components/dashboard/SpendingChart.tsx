import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORIES } from "@/lib/constants";

const CHART_COLORS = ["hsl(250,80%,64%)", "hsl(160,84%,39%)", "hsl(38,92%,50%)", "hsl(280,67%,60%)", "hsl(0,84%,60%)", "hsl(200,80%,50%)"];

interface Props {
  categoryTotals: { category: string; total: number }[];
}

export function SpendingChart({ categoryTotals }: Props) {
  const pieData = useMemo(() => {
    return categoryTotals.map((ct) => {
      const cat = CATEGORIES.find((c) => c.id === ct.category);
      return { name: cat?.label || ct.category, value: ct.total, icon: cat?.icon || "📌" };
    });
  }, [categoryTotals]);

  if (pieData.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground font-display">Spending Breakdown</h2>
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(0)} MAD`}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem", fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
          {pieData.map((entry, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-[11px] text-muted-foreground">{entry.icon} {entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
