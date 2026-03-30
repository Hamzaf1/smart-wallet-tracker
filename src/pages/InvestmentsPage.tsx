import { AppLayout } from "@/components/AppLayout";
import { useInvestments, useCreateInvestment, useDeleteInvestment } from "@/hooks/useInvestments";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const TYPES = ["stocks", "bonds", "crypto", "real_estate", "other"];
const TYPE_COLORS = ["hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,67%,60%)", "hsl(0,84%,60%)"];

export default function InvestmentsPage() {
  const t = useI18n((s) => s.t);
  const { data: investments = [], isLoading } = useInvestments();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("stocks");
  const [balance, setBalance] = useState("");
  const [returns, setReturns] = useState("");
  const [growth, setGrowth] = useState("");

  const totalBalance = useMemo(() => investments.reduce((s, i) => s + i.balance, 0), [investments]);
  const totalReturns = useMemo(() => investments.reduce((s, i) => s + i.returns, 0), [investments]);

  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    investments.forEach((inv) => { grouped[inv.type] = (grouped[inv.type] || 0) + inv.balance; });
    return Object.entries(grouped).map(([name, value]) => ({ name: t(name), value }));
  }, [investments, t]);

  const handleSubmit = async () => {
    if (!name || !balance) return;
    try {
      await createInvestment.mutateAsync({ name, type, balance: Number(balance), returns: Number(returns) || 0, growth: Number(growth) || 0 });
      toast.success("Investment added");
      setName(""); setBalance(""); setReturns(""); setGrowth(""); setShowForm(false);
    } catch { toast.error("Failed"); }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{t("investment_portfolio")}</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("add")}
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
          <p className="text-sm opacity-80">{t("total")} {t("balance")}</p>
          <p className="text-2xl font-bold mt-1">{totalBalance.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{t("returns")}: {totalReturns.toLocaleString("en-US", { style: "currency", currency: "MAD" })}</span>
          </div>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (<Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(0)} MAD`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
              {pieData.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span className="text-[11px] text-muted-foreground">{e.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card rounded-xl p-4 border border-border space-y-3">
              <Input placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((tp) => (<SelectItem key={tp} value={tp}>{t(tp)}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input placeholder={t("balance") + " (MAD)"} type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
              <Input placeholder={t("returns") + " (MAD)"} type="number" value={returns} onChange={(e) => setReturns(e.target.value)} />
              <Input placeholder={t("growth") + " (%)"} type="number" value={growth} onChange={(e) => setGrowth(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmit}>{t("add")}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {investments.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("no_data")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {investments.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">{inv.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.name}</p>
                  <p className="text-xs text-muted-foreground">{t(inv.type)} · {inv.growth}% {t("growth")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{inv.balance.toLocaleString()} MAD</p>
                  <p className={`text-xs ${inv.returns >= 0 ? "text-income" : "text-expense"}`}>
                    {inv.returns >= 0 ? "+" : ""}{inv.returns.toLocaleString()} MAD
                  </p>
                </div>
                <button onClick={() => deleteInvestment.mutate(inv.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
