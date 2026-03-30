import { AppLayout } from "@/components/AppLayout";
import { useCarExpenses, useCreateCarExpense, useDeleteCarExpense, CAR_EXPENSE_TYPES } from "@/hooks/useCarExpenses";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Car } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function CarExpensesPage() {
  const t = useI18n((s) => s.t);
  const { data: expenses = [], isLoading } = useCarExpenses();
  const createExpense = useCreateCarExpense();
  const deleteExpense = useDeleteCarExpense();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("fuel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((e) => { grouped[e.type] = (grouped[e.type] || 0) + e.amount; });
    return Object.entries(grouped).map(([type, value]) => {
      const meta = CAR_EXPENSE_TYPES.find((c) => c.id === type);
      return { name: t(type), value, icon: meta?.icon || "🚗", color: meta?.color || "hsl(0,0%,50%)" };
    });
  }, [expenses, t]);

  const handleSubmit = async () => {
    if (!amount) return;
    try {
      await createExpense.mutateAsync({ type, amount: Number(amount), note: note || undefined });
      toast.success("Expense added");
      setAmount(""); setNote(""); setShowForm(false);
    } catch { toast.error("Failed"); }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{t("car_expense_tracker")}</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("add")}
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
          <p className="text-sm opacity-80">{t("total")} {t("car_expenses")}</p>
          <p className="text-2xl font-bold mt-1">{totalExpenses.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(0)} MAD`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
              {pieData.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-[11px] text-muted-foreground">{e.icon} {e.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card rounded-xl p-4 border border-border space-y-3">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAR_EXPENSE_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>{ct.icon} {t(ct.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder={t("amount") + " (MAD)"} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input placeholder={t("note")} value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmit}>{t("add")}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {expenses.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("no_data")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp, i) => {
              const meta = CAR_EXPENSE_TYPES.find((c) => c.id === exp.type);
              return (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">{meta?.icon || "🚗"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t(exp.type)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}{exp.note && ` · ${exp.note}`}</p>
                  </div>
                  <p className="text-sm font-bold text-expense">{exp.amount.toLocaleString()} MAD</p>
                  <button onClick={() => deleteExpense.mutate(exp.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
