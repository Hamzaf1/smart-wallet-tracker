import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Wallet, Building2, Banknote, CreditCard, PiggyBank } from "lucide-react";

const PRESET_ACCOUNTS = [
  { name: "CIH Bank", icon: "building", color: "#e11d48" },
  { name: "Barid Bank", icon: "banknote", color: "#f59e0b" },
  { name: "Cash", icon: "wallet", color: "#10b981" },
  { name: "Attijariwafa", icon: "building", color: "#3b82f6" },
  { name: "BMCE Bank", icon: "credit-card", color: "#8b5cf6" },
  { name: "Savings", icon: "piggy-bank", color: "#06b6d4" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  building: <Building2 className="h-5 w-5" />,
  banknote: <Banknote className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
  "credit-card": <CreditCard className="h-5 w-5" />,
  "piggy-bank": <PiggyBank className="h-5 w-5" />,
};

interface SelectedAccount {
  name: string;
  icon: string;
  color: string;
  balance: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>([]);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"select" | "balances">("select");

  const togglePreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    const exists = selectedAccounts.find((a) => a.name === preset.name);
    if (exists) {
      setSelectedAccounts(selectedAccounts.filter((a) => a.name !== preset.name));
    } else {
      setSelectedAccounts([...selectedAccounts, { ...preset, balance: "0" }]);
    }
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    if (selectedAccounts.find((a) => a.name.toLowerCase() === customName.trim().toLowerCase())) return;
    setSelectedAccounts([
      ...selectedAccounts,
      { name: customName.trim(), icon: "wallet", color: "#6366f1", balance: "0" },
    ]);
    setCustomName("");
  };

  const updateBalance = (index: number, balance: string) => {
    const updated = [...selectedAccounts];
    updated[index].balance = balance;
    setSelectedAccounts(updated);
  };

  const removeAccount = (index: number) => {
    setSelectedAccounts(selectedAccounts.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const inserts = selectedAccounts.map((a) => ({
        user_id: user.id,
        name: a.name,
        icon: a.icon,
        color: a.color,
        balance: parseFloat(a.balance) || 0,
      }));

      const { error } = await supabase.from("accounts").insert(inserts);
      if (error) throw error;

      localStorage.setItem("onboarding_complete", "true");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-40%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium tracking-wider uppercase">
            <span className={`w-6 h-1 rounded-full ${step === "select" ? "bg-primary" : "bg-primary/30"}`} />
            <span className={`w-6 h-1 rounded-full ${step === "balances" ? "bg-primary" : "bg-primary/30"}`} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === "select" ? "Set up your accounts" : "Set starting balances"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === "select"
              ? "Choose the accounts you want to track. You can add more later."
              : "Enter your current balance for each account."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 space-y-4"
            >
              {/* Preset grid */}
              <div className="grid grid-cols-2 gap-3">
                {PRESET_ACCOUNTS.map((preset) => {
                  const isSelected = selectedAccounts.some((a) => a.name === preset.name);
                  return (
                    <motion.button
                      key={preset.name}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => togglePreset(preset)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/50 bg-card hover:border-border"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: preset.color + "20", color: preset.color }}
                      >
                        {ICON_MAP[preset.icon] || <Wallet className="h-5 w-5" />}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{preset.name}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom account */}
              <div className="flex gap-2">
                <Input
                  placeholder="Custom account name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  className="h-11 bg-card border-border/50 rounded-xl text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addCustom}
                  className="h-11 w-11 shrink-0 rounded-xl"
                  disabled={!customName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="balances"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 space-y-3"
            >
              {selectedAccounts.map((account, i) => (
                <motion.div
                  key={account.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: account.color + "20", color: account.color }}
                  >
                    {ICON_MAP[account.icon] || <Wallet className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">MAD</span>
                    <Input
                      type="number"
                      value={account.balance}
                      onChange={(e) => updateBalance(i, e.target.value)}
                      className="w-24 h-9 text-right text-sm bg-background border-border/50 rounded-lg"
                      placeholder="0.00"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAccount(i)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom actions */}
        <div className="mt-8 space-y-3">
          {step === "select" ? (
            <>
              <Button
                className="w-full h-[52px] rounded-xl text-[15px] font-semibold bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20"
                disabled={selectedAccounts.length === 0}
                onClick={() => setStep("balances")}
              >
                Continue ({selectedAccounts.length} selected)
              </Button>
              <Button
                variant="ghost"
                className="w-full h-11 text-sm text-muted-foreground"
                onClick={() => {
                  localStorage.setItem("onboarding_complete", "true");
                  navigate("/", { replace: true });
                }}
              >
                Skip for now
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full h-[52px] rounded-xl text-[15px] font-semibold bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20"
                disabled={saving}
                onClick={handleFinish}
              >
                {saving ? "Setting up..." : "Finish Setup"}
              </Button>
              <Button
                variant="ghost"
                className="w-full h-11 text-sm text-muted-foreground"
                onClick={() => setStep("select")}
              >
                Back
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
