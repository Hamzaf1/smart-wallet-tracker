import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CarExpense {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export const CAR_EXPENSE_TYPES = [
  { id: "fuel", icon: "⛽", color: "hsl(38, 92%, 50%)" },
  { id: "maintenance", icon: "🔧", color: "hsl(217, 91%, 60%)" },
  { id: "insurance", icon: "🛡️", color: "hsl(142, 71%, 45%)" },
  { id: "parking", icon: "🅿️", color: "hsl(280, 67%, 60%)" },
  { id: "toll", icon: "🛣️", color: "hsl(200, 80%, 50%)" },
  { id: "other", icon: "🚗", color: "hsl(0, 84%, 60%)" },
];

export function useCarExpenses() {
  return useQuery<CarExpense[]>({
    queryKey: ["car-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as CarExpense[];
    },
  });
}

export function useCreateCarExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: string; amount: number; date?: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("car_expenses")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["car-expenses"] }),
  });
}

export function useDeleteCarExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["car-expenses"] }),
  });
}
