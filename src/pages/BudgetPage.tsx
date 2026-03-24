import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useBudgets, useUpsertBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useMonthlyStats } from "@/hooks/useFinanceData";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Target, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BudgetPage() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const { data: budgets = [] } = useBudgets(currentMonth);
  const { data: stats } = useMonthlyStats();
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const spentByCategory: Record<string, number> = {};
  stats?.category_totals.forEach((ct) => {
    spentByCategory[ct.category] = ct.total;
  });

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  const existingCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = CATEGORIES.filter(
    (c) => !existingCategories.has(c.id) && !["salary", "freelance"].includes(c.id)
  );

  const handleAdd = async () => {
    if (!newCategory || !newAmount) return;
    try {
      await upsertBudget.mutateAsync({
        category: newCategory,
        amount: parseFloat(newAmount),
        month: currentMonth,
      });
      setNewCategory("");
      setNewAmount("");
      setShowAdd(false);
      toast.success("Budget added");
    } catch {
      toast.error("Failed to add budget");
    }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6 pb-24">
        <div>
          <h1 className="text-xl font-bold text-foreground">Budget</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
        </div>

        {/* Overview */}
        <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="text-2xl font-bold text-foreground">{totalSpent.toFixed(0)} MAD</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-lg font-semibold text-muted-foreground">{totalBudget.toFixed(0)} MAD</p>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                totalBudget > 0 && totalSpent / totalBudget > 0.9
                  ? "bg-expense"
                  : totalBudget > 0 && totalSpent / totalBudget > 0.7
                  ? "bg-chart-3"
                  : "bg-primary"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% used` : "No budgets set"}
          </p>
        </div>

        {/* Category budgets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Categories</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(!showAdd)}
              className="h-8 text-primary"
            >
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
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="h-11 rounded-xl bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Budget amount (MAD)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <Button onClick={handleAdd} className="w-full h-11 rounded-xl" disabled={!newCategory || !newAmount}>
                  Set Budget
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Budget list */}
          {budgets.length === 0 && !showAdd ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center space-y-2">
              <Target className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No budgets set yet</p>
              <p className="text-xs text-muted-foreground">Add category budgets to track your spending</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgets.map((budget, i) => {
                const cat = CATEGORIES.find((c) => c.id === budget.category);
                const spent = spentByCategory[budget.category] || 0;
                const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                const over = pct > 100;
                const warning = pct > 80;

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-3.5 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{cat?.icon || "📌"}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{cat?.label || budget.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {spent.toFixed(0)} / {budget.amount.toFixed(0)} MAD
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {over && <AlertTriangle className="h-4 w-4 text-expense" />}
                        <span className={`text-xs font-semibold ${over ? "text-expense" : warning ? "text-chart-3" : "text-primary"}`}>
                          {Math.round(pct)}%
                        </span>
                        <button
                          onClick={() => deleteBudget.mutate(budget.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${over ? "bg-expense" : warning ? "bg-chart-3" : "bg-primary"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
