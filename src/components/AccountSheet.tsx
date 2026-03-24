import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNT_ICONS, ACCOUNT_COLORS } from "@/lib/constants";
import { useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useFinanceData";
import type { Account } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(String(account.balance));
      setColor(account.color);
      setIcon(account.icon);
    } else {
      setName("");
      setBalance("");
      setColor(ACCOUNT_COLORS[0]);
      setIcon("🏦");
    }
  }, [account, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      color,
      icon,
    };

    if (account) {
      updateMutation.mutate(
        { id: account.id, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const handleDelete = () => {
    if (account && confirm("Delete this account and all its transactions?")) {
      deleteMutation.mutate(account.id, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-md mx-auto pb-10">
        <SheetHeader>
          <SheetTitle>{account ? "Edit" : "Add"} Account</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Account name (e.g. CIH, Cash)"
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

          {/* Icon */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icon</p>
            <div className="flex gap-2">
              {Object.entries(ACCOUNT_ICONS).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "w-12 h-12 rounded-xl text-xl flex items-center justify-center border transition-colors",
                    icon === emoji ? "border-primary bg-primary/10" : "border-border bg-muted"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : account ? "Update" : "Add Account"}
          </Button>

          {account && (
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete Account
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
