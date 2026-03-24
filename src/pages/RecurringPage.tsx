import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useRecurringTransactions, useCreateRecurring, useDeleteRecurring, useUpdateRecurring } from "@/hooks/useRecurring";
import { useAccounts } from "@/hooks/useFinanceData";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCw, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function RecurringPage() {
  const { data: recurring = [] } = useRecurringTransactions();
  const { data: accounts = [] } = useAccounts();
  const createRecurring = useCreateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const updateRecurring = useUpdateRecurring();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    account_id: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    note: "",
    frequency: "monthly",
    next_date: format(new Date(), "yyyy-MM-dd"),
  });

  const handleAdd = async () => {
    if (!form.account_id || !form.amount || !form.category) {
      toast.error("Fill in all required fields");
      return;
    }
    try {
      await createRecurring.mutateAsync({
        account_id: form.account_id,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        note: form.note || null,
        frequency: form.frequency,
        next_date: new Date(form.next_date).toISOString(),
        is_active: true,
      });
      setForm({ account_id: "", amount: "", type: "expense", category: "", note: "", frequency: "monthly", next_date: format(new Date(), "yyyy-MM-dd") });
      setShowAdd(false);
      toast.success("Recurring transaction added");
    } catch {
      toast.error("Failed to add");
    }
  };

  const toggleActive = async (item: typeof recurring[0]) => {
    await updateRecurring.mutateAsync({ id: item.id, is_active: !item.is_active });
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Recurring</h1>
            <p className="text-sm text-muted-foreground">Auto-add transactions on schedule</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-xl h-9">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl p-4 border border-border space-y-3"
            >
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.type === "expense" ? "default" : "outline"}
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setForm({ ...form, type: "expense" })}
                >Expense</Button>
                <Button
                  type="button"
                  variant={form.type === "income" ? "default" : "outline"}
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setForm({ ...form, type: "income" })}
                >Income</Button>
              </div>

              <Input type="number" placeholder="Amount (MAD)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-11 rounded-xl" />

              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
              </Select>

              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>

              <Input type="date" value={form.next_date} onChange={(e) => setForm({ ...form, next_date: e.target.value })} className="h-11 rounded-xl" />

              <Input placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-11 rounded-xl" />

              <Button onClick={handleAdd} className="w-full h-11 rounded-xl" disabled={createRecurring.isPending}>
                Add Recurring
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {recurring.length === 0 && !showAdd ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center space-y-2">
            <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No recurring transactions</p>
            <p className="text-xs text-muted-foreground">Add salary, rent, or subscriptions</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recurring.map((item, i) => {
              const cat = CATEGORIES.find((c) => c.id === item.category);
              const account = accounts.find((a) => a.id === item.account_id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl p-3.5 border border-border ${!item.is_active ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                      {cat?.icon || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.note || cat?.label || item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {FREQUENCY_LABELS[item.frequency]} · {account?.name || "—"} · Next: {format(new Date(item.next_date), "MMM d")}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${item.type === "income" ? "text-income" : "text-expense"}`}>
                      {item.type === "income" ? "+" : "-"}{item.amount.toFixed(0)}
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(item)} className="text-muted-foreground hover:text-foreground p-1">
                        {item.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => deleteRecurring.mutate(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
