import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/stores/authStore";
import { TrendingUp, TrendingDown, ArrowRight, Lightbulb, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { useMemo } from "react";
import { useAccounts, useTransactions, useMonthlyStats } from "@/hooks/useFinanceData";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: stats } = useMonthlyStats();
  const { data: insights = [] } = useMonthlyInsights();

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const monthlyIncome = stats?.total_income ?? 0;
  const monthlyExpense = stats?.total_expense ?? 0;

  const trendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
    if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const trendColor = (trend: string, type: string) => {
    if (type === "savings_rate") return trend === "up" ? "text-expense" : "text-income";
    if (type === "spending_trend") return trend === "up" ? "text-expense" : "text-income";
    if (trend === "up") return "text-expense";
    if (trend === "down") return "text-income";
    return "text-muted-foreground";
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-xl font-bold text-foreground">
            {user?.name || user?.email?.split("@")[0] || "User"}
          </h1>
        </div>

        {/* Balance Card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
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
                <p className="text-sm font-semibold">
                  {monthlyIncome.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-expense/20 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-expense" />
              </div>
              <div>
                <p className="text-[10px] opacity-70">Expenses</p>
                <p className="text-sm font-semibold">
                  {monthlyExpense.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-3" />
              <h2 className="text-base font-semibold text-foreground">Monthly Insights</h2>
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
                  <div className={`mt-0.5 shrink-0 ${trendColor(insight.trend, insight.type)}`}>
                    {trendIcon(insight.trend)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{insight.message}</p>
                    {insight.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.detail}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Spending by Category */}
        {stats?.category_totals && stats.category_totals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Spending by Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.category_totals.slice(0, 4).map((ct) => {
                const cat = CATEGORIES.find((c) => c.id === ct.category);
                return (
                  <div key={ct.category} className="bg-card rounded-xl p-3 border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon || "📌"}</span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {cat?.label || ct.category}
                      </span>
                    </div>
                    <p className="text-base font-bold text-foreground mt-1">
                      {ct.total.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
            <button
              onClick={() => navigate("/transactions")}
              className="text-primary text-xs font-medium flex items-center gap-1"
            >
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
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                      {cat?.icon || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {cat?.label || tx.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.accounts?.name} · {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString("en-US", {
                        style: "currency",
                        currency: "MAD",
                      })}
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
