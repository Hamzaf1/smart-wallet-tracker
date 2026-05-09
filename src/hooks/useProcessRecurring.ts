import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

function advanceDate(d: Date, frequency: string): Date {
  const next = new Date(d);
  switch (frequency) {
    case "daily": next.setDate(next.getDate() + 1); break;
    case "weekly": next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly": next.setFullYear(next.getFullYear() + 1); break;
    default: next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Processes any active recurring transactions whose next_date is in the past:
 * - inserts a transaction for each occurrence (catching up if multiple periods passed)
 * - advances next_date accordingly
 */
export function useProcessRecurring(session: Session | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    (async () => {
      const nowIso = new Date().toISOString();
      const { data: due, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("is_active", true)
        .lte("next_date", nowIso);

      if (error || !due || cancelled) return;

      let createdAny = false;

      for (const r of due) {
        let nextDate = new Date(r.next_date);
        const occurrences: string[] = [];
        // safety cap to prevent runaway loops
        let guard = 0;
        while (nextDate <= new Date() && guard < 60) {
          occurrences.push(nextDate.toISOString());
          nextDate = advanceDate(nextDate, r.frequency);
          guard++;
        }
        if (occurrences.length === 0) continue;

        const rows = occurrences.map((date) => ({
          user_id: r.user_id,
          account_id: r.account_id,
          amount: r.amount,
          type: r.type,
          category: r.category,
          note: r.note,
          date,
        }));

        const { error: insErr } = await supabase.from("transactions").insert(rows);
        if (insErr) continue;

        await supabase
          .from("recurring_transactions")
          .update({ next_date: nextDate.toISOString() })
          .eq("id", r.id);

        createdAny = true;
      }

      if (createdAny && !cancelled) {
        qc.invalidateQueries({ queryKey: ["transactions"] });
        qc.invalidateQueries({ queryKey: ["accounts"] });
        qc.invalidateQueries({ queryKey: ["monthly-stats"] });
        qc.invalidateQueries({ queryKey: ["recurring-transactions"] });
      }
    })();

    return () => { cancelled = true; };
  }, [session?.user?.id, qc]);
}
