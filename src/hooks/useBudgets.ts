import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
}

export function useBudgets(month?: string) {
  const m = month || format(new Date(), "yyyy-MM");
  return useQuery<Budget[]>({
    queryKey: ["budgets", m],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", m)
        .order("category");
      if (error) throw error;
      return data as Budget[];
    },
  });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { category: string; amount: number; month: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("budgets")
        .upsert(
          { user_id: user.id, category: input.category, amount: input.amount, month: input.month },
          { onConflict: "user_id,category,month" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
