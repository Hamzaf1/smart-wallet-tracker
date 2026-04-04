import { AppLayout } from "@/components/AppLayout";
import { TrendingUp, TrendingDown, ArrowRight, Lightbulb, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { useMemo } from "react";
import { useAccounts, useTransactions, useMonthlyStats } from "@/hooks/useFinanceData";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { useMonthlyChartData } from "@/hooks/useChartData";
import { motion } from "framer-motion";
import { usePredictiveBalance } from "@/hooks/usePredictiveBalance";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { User } from "lucide-react";

const CHART_COLORS = ["hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,67%,60%)", "hsl(0,84%,60%)", "hsl(200,80%,50%)"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: stats } = useMonthlyStats();
  const { data: insights = [] } = useMonthlyInsights();
  const { data: chartData = [] } = useMonthlyChartData(6);
  const prediction = usePredictiveBalance();
  const { data: profile } = useProfile();

  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const monthlyIncome = stats?.total_income ?? 0;
  const monthlyExpense = stats?.total_expense ?? 0;

  const pieData = useMemo(() => {
    if (!stats?.category_totals) return [];
    return stats.category_totals.map((ct) => {
      const cat = CATEGORIES.find((c) => c.id === ct.category);
      return { name: cat?.label || ct.category, value: ct.total, icon: cat?.icon || "📌" };
    });
  }, [stats]);

  const trendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
    if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const trendColor = (trend: string, type: string) => {
    if (type === "savings_rate" || type === "spending_trend") return trend === "up" ? "text-expense" : "text-income";
    return trend === "up" ? "text-expense" : trend === "down" ? "text-income" : "text-muted-foreground";
  };

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "User";

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6 pb-24">
        {/* Header with Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-md">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-muted-foreground text-xs">Welcome back,</p>
            <h1 className="text-lg font-bold text-foreground leading-tight">{displayName}</h1>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-lg shadow-primary/20">
          <p className="text-sm opacity-80">Total Balance</p>
          <p className="text-3xl font-bold mt-1">
            {totalBalance.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
          </p>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-income/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-income" />
              </div>
              <div>
                <p className="text-[10px] opacity-70">Income</p>
                <p className="text-sm font-semibold">{monthlyIncome.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-expense/20 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-expense" />
              </div>
              <div>
                <p className="text-[10px] opacity-70">Expenses</p>
                <p className="text-sm font-semibold">{monthlyExpense.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Balance */}
        {prediction.daysLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 border border-border space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted End-of-Month Balance</p>
                <p className={`text-lg font-bold ${prediction.predictedBalance >= 0 ? "text-income" : "text-expense"}`}>
                  {prediction.predictedBalance.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-[11px] text-muted-foreground">
              <span>{prediction.daysLeft} days left</span>
              <span>~{prediction.dailySpendRate.toFixed(0)} MAD/day spending</span>
            </div>
          </motion.div>
        )}

        {/* Monthly Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-3" />
              <h2 className="text-base font-semibold text-foreground">Insights</h2>
            </div>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 bg-card rounded-xl p-3.5 border border-border/50"
                >
                  <div className={`mt-0.5 shrink-0 ${trendColor(insight.trend, insight.type)}`}>{trendIcon(insight.trend)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{insight.message}</p>
                    {insight.detail && <p className="text-xs text-muted-foreground mt-0.5">{insight.detail}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Spending Pie Chart */}
        {pieData.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Spending Breakdown</h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(0)} MAD`}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }}
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
        )}

        {/* Monthly Trend Bar Chart */}
        {chartData.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Monthly Trend</h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }}
                    formatter={(value: number) => `${value.toFixed(0)} MAD`}
                  />
                  <Bar dataKey="income" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-income" /><span className="text-[11px] text-muted-foreground">Income</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-expense" /><span className="text-[11px] text-muted-foreground">Expense</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
            <button onClick={() => navigate("/transactions")} className="text-primary text-xs font-medium flex items-center gap-1">
              See all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <p className="text-muted-foreground text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => {
                const cat = CATEGORIES.find((c) => c.id === tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
                    <CategoryIcon category={tx.category} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cat?.label || tx.category}</p>
                      <p className="text-xs text-muted-foreground">{tx.accounts?.name} · {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-sm font-bold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                      {tx.type === "income" ? "+" : "-"}{Math.abs(tx.amount).toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
