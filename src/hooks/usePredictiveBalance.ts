import { useMemo } from "react";
import { useAccounts, useTransactions } from "@/hooks/useFinanceData";
import { useRecurringTransactions } from "@/hooks/useRecurring";

export function usePredictiveBalance() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: recurring = [] } = useRecurringTransactions();

  return useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = Math.max(0, endOfMonth.getDate() - now.getDate());
    const totalDays = endOfMonth.getDate();
    const daysPassed = totalDays - daysLeft;

    const currentBalance = accounts.reduce((s, a) => s + a.balance, 0);

    // Calculate daily spending rate from this month's transactions
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTx = transactions.filter((t) => new Date(t.date) >= monthStart);
    const monthExpenses = thisMonthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const dailySpendRate = daysPassed > 0 ? monthExpenses / daysPassed : 0;

    // Upcoming recurring income/expenses
    const upcomingRecurring = recurring
      .filter((r) => r.is_active && new Date(r.next_date) <= endOfMonth && new Date(r.next_date) > now)
      .reduce((s, r) => s + (r.type === "income" ? r.amount : -r.amount), 0);

    const projectedExpenses = dailySpendRate * daysLeft;
    const predictedBalance = currentBalance - projectedExpenses + upcomingRecurring;

    return {
      currentBalance,
      predictedBalance,
      daysLeft,
      dailySpendRate,
      projectedExpenses,
      upcomingRecurring,
    };
  }, [accounts, transactions, recurring]);
}