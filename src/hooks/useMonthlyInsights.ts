import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface MonthlyInsight {
  type: "spending_trend" | "top_category" | "savings_rate" | "category_change";
  message: string;
  detail?: string;
  trend: "up" | "down" | "neutral";
  value?: number;
}

export function useMonthlyInsights() {
  return useQuery<MonthlyInsight[]>({
    queryKey: ["monthly-insights"],
    queryFn: async () => {
      const now = new Date();
      const thisStart = startOfMonth(now).toISOString();
      const thisEnd = endOfMonth(now).toISOString();
      const lastStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastEnd = endOfMonth(subMonths(now, 1)).toISOString();

      const [thisMonth, lastMonth] = await Promise.all([
        supabase.from("transactions").select("amount, type, category").gte("date", thisStart).lte("date", thisEnd),
        supabase.from("transactions").select("amount, type, category").gte("date", lastStart).lte("date", lastEnd),
      ]);

      if (thisMonth.error || lastMonth.error) return [];

      const sum = (rows: any[], type: string) => rows.filter((r) => r.type === type).reduce((s, r) => s + Number(r.amount), 0);
      const catTotals = (rows: any[]) => {
        const m: Record<string, number> = {};
        rows.filter((r) => r.type === "expense").forEach((r) => { m[r.category] = (m[r.category] || 0) + Number(r.amount); });
        return m;
      };

      const thisExpense = sum(thisMonth.data || [], "expense");
      const lastExpense = sum(lastMonth.data || [], "expense");
      const thisIncome = sum(thisMonth.data || [], "income");
      const lastIncome = sum(lastMonth.data || [], "income");
      const thisCats = catTotals(thisMonth.data || []);
      const lastCats = catTotals(lastMonth.data || []);

      const insights: MonthlyInsight[] = [];

      // 1. Spending trend
      if (lastExpense > 0) {
        const pct = ((thisExpense - lastExpense) / lastExpense) * 100;
        const absPct = Math.abs(Math.round(pct));
        if (absPct >= 5) {
          insights.push({
            type: "spending_trend",
            message: pct > 0
              ? `You spent ${absPct}% more than last month`
              : `You spent ${absPct}% less than last month`,
            trend: pct > 0 ? "up" : "down",
            value: absPct,
          });
        }
      } else if (thisExpense > 0) {
        insights.push({
          type: "spending_trend",
          message: "This is your first month tracking expenses!",
          trend: "neutral",
        });
      }

      // 2. Top category
      const topCat = Object.entries(thisCats).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        const pctOfTotal = thisExpense > 0 ? Math.round((topCat[1] / thisExpense) * 100) : 0;
        insights.push({
          type: "top_category",
          message: `${topCat[0]} is your biggest expense at ${pctOfTotal}%`,
          detail: `${topCat[1].toFixed(0)} MAD this month`,
          trend: "neutral",
          value: pctOfTotal,
        });
      }

      // 3. Savings rate
      if (thisIncome > 0) {
        const saved = thisIncome - thisExpense;
        const rate = Math.round((saved / thisIncome) * 100);
        insights.push({
          type: "savings_rate",
          message: rate > 0
            ? `You're saving ${rate}% of your income this month`
            : `You're spending ${Math.abs(rate)}% more than you earn`,
          trend: rate >= 20 ? "down" : rate > 0 ? "neutral" : "up",
          value: rate,
        });
      }

      // 4. Category with biggest increase
      const catChanges = Object.entries(thisCats)
        .filter(([cat]) => lastCats[cat] && lastCats[cat] > 0)
        .map(([cat, val]) => ({ cat, change: ((val - lastCats[cat]) / lastCats[cat]) * 100 }))
        .sort((a, b) => b.change - a.change);

      if (catChanges.length > 0 && catChanges[0].change > 20) {
        const top = catChanges[0];
        insights.push({
          type: "category_change",
          message: `${top.cat} spending up ${Math.round(top.change)}% vs last month`,
          trend: "up",
          value: Math.round(top.change),
        });
      }

      return insights;
    },
  });
}
