import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAccounts, useTransactions, useMonthlyStats } from "@/hooks/useFinanceData";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { useMonthlyChartData } from "@/hooks/useChartData";
import { usePredictiveBalance } from "@/hooks/usePredictiveBalance";
import { useProfile } from "@/hooks/useProfile";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PredictiveCard } from "@/components/dashboard/PredictiveCard";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

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

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "User";

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-5 pb-24">
        <DashboardHeader displayName={displayName} avatarUrl={profile?.avatar_url} />
        <BalanceCard totalBalance={totalBalance} monthlyIncome={monthlyIncome} monthlyExpense={monthlyExpense} />
        {prediction.daysLeft > 0 && <PredictiveCard prediction={prediction} />}
        {insights.length > 0 && <InsightsSection insights={insights} />}
        {stats?.category_totals && <SpendingChart categoryTotals={stats.category_totals} />}
        {chartData.length > 0 && <TrendChart chartData={chartData} />}
        <RecentTransactions transactions={recentTransactions} onSeeAll={() => navigate("/transactions")} />
      </div>
    </AppLayout>
  );
}
