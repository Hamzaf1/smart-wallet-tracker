import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

export function useMonthlyChartData(months = 6) {
  return useQuery<MonthlyChartData[]>({
    queryKey: ["monthly-chart", months],
    queryFn: async () => {
      const now = new Date();
      const start = startOfMonth(subMonths(now, months - 1)).toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, date")
        .gte("date", start);

      if (error) throw error;

      const map: Record<string, { income: number; expense: number }> = {};
      for (let i = 0; i < months; i++) {
        const key = format(subMonths(now, months - 1 - i), "yyyy-MM");
        map[key] = { income: 0, expense: 0 };
      }

      for (const t of data || []) {
        const key = t.date.substring(0, 7);
        if (map[key]) {
          if (t.type === "income") map[key].income += Number(t.amount);
          else map[key].expense += Number(t.amount);
        }
      }

      return Object.entries(map).map(([month, vals]) => ({
        month: format(new Date(month + "-01"), "MMM"),
        ...vals,
      }));
    },
  });
}
