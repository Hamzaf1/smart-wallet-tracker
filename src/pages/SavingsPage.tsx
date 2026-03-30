import { AppLayout } from "@/components/AppLayout";
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal } from "@/hooks/useSavings";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Edit2, Target } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SavingsPage() {
  const t = useI18n((s) => s.t);
  const { data: goals = [], isLoading } = useSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);

  const resetForm = () => {
    setName(""); setTargetAmount(""); setCurrentAmount(""); setEditId(null); setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name || !targetAmount) return;
    try {
      if (editId) {
        await updateGoal.mutateAsync({ id: editId, name, target_amount: Number(targetAmount), current_amount: Number(currentAmount) || 0 });
        toast.success("Goal updated");
      } else {
        await createGoal.mutateAsync({ name, target_amount: Number(targetAmount), current_amount: Number(currentAmount) || 0 });
        toast.success("Goal created");
      }
      resetForm();
    } catch { toast.error("Failed"); }
  };

  const startEdit = (g: any) => {
    setEditId(g.id); setName(g.name); setTargetAmount(String(g.target_amount)); setCurrentAmount(String(g.current_amount)); setShowForm(true);
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{t("savings_goals")}</h1>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> {t("add")}
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
          <p className="text-sm opacity-80">{t("total")} {t("savings")}</p>
          <p className="text-2xl font-bold mt-1">{totalSaved.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
          <p className="text-xs opacity-70 mt-1">{t("target")}: {totalTarget.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
          {totalTarget > 0 && <Progress value={(totalSaved / totalTarget) * 100} className="mt-3 h-2 bg-primary-foreground/20" />}
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card rounded-xl p-4 border border-border space-y-3">
              <Input placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder={t("target") + " (MAD)"} type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
              <Input placeholder={t("current") + " (MAD)"} type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmit}>{editId ? t("save") : t("add")}</Button>
                <Button variant="outline" onClick={resetForm}>{t("cancel")}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        {goals.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("no_data")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("add_first")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, i) => {
              const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{goal.icon}</span>
                      <span className="font-medium text-sm text-foreground">{goal.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(goal)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button onClick={() => deleteGoal.mutate(goal.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()} MAD</span>
                    <span className="text-xs font-semibold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
