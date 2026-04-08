import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface Props {
  chartData: { month: string; income: number; expense: number }[];
}

export function TrendChart({ chartData }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground font-display">Monthly Trend</h2>
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem", fontSize: "12px" }}
              formatter={(value: number) => `${value.toFixed(0)} MAD`}
            />
            <Bar dataKey="income" fill="hsl(160,84%,39%)" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="hsl(0,84%,60%)" radius={[6, 6, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-income" /><span className="text-[11px] text-muted-foreground">Income</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-expense" /><span className="text-[11px] text-muted-foreground">Expense</span></div>
        </div>
      </div>
    </div>
  );
}
