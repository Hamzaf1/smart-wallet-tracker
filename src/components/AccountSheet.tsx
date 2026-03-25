import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNT_COLORS, MOROCCAN_BANKS } from "@/lib/constants";
import { useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useFinanceData";
import type { Account } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export function AccountSheet({ open, onOpenChange, account }: Props) {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [icon, setIcon] = useState("🏦");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(String(account.balance));
      setColor(account.color);
      setIcon(account.icon);
      setSelectedPreset(null);
    } else {
      setName("");
      setBalance("");
      setColor(ACCOUNT_COLORS[0]);
      setIcon("🏦");
      setSelectedPreset(null);
    }
  }, [account, open]);

  const handlePreset = (presetId: string) => {
    const preset = MOROCCAN_BANKS.find((b) => b.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    if (presetId !== "custom") {
      setName(preset.name);
      setIcon(preset.icon);
      setColor(preset.color);
    } else {
      setName("");
      setIcon(preset.icon);
      setColor(preset.color);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), balance: parseFloat(balance) || 0, color, icon };
    if (account) {
      updateMutation.mutate({ id: account.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const handleDelete = () => {
    if (account && confirm("Delete this account and all its transactions?")) {
      deleteMutation.mutate(account.id, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-md mx-auto pb-10 max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{account ? "Edit" : "Add"} Account</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Bank Presets - only for new accounts */}
          {!account && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Choose a bank</p>
              <div className="grid grid-cols-3 gap-2">
                {MOROCCAN_BANKS.map((bank, i) => (
                  <motion.button
                    key={bank.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handlePreset(bank.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-center",
                      selectedPreset === bank.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    )}
                  >
                    <span className="text-xl">{bank.icon}</span>
                    <span className="text-[10px] font-medium text-foreground leading-tight">{bank.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <Input
            placeholder="Account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 bg-card"
          />

          <Input
            type="number"
            placeholder="Initial balance (MAD)"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="h-12 bg-card"
          />

          {/* Color */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button className="w-full h-12 text-base font-semibold" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : account ? "Update" : "Add Account"}
          </Button>

          {account && (
            <Button variant="destructive" className="w-full h-12" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete Account
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
