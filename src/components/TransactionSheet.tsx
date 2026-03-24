import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { useAccounts, useCreateTransaction, useUpdateTransaction } from "@/hooks/useFinanceData";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function TransactionSheet({ open, onOpenChange, transaction }: Props) {
  const { data: accounts = [] } = useAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [accountId, setAccountId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setAccountId(transaction.account_id);
      setNote(transaction.note || "");
      setDate(transaction.date.split("T")[0]);
    } else {
      setType("expense");
      setAmount("");
      setCategory("food");
      setAccountId(accounts[0]?.id || "");
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [transaction, open, accounts]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || !accountId) return;

    const payload = {
      amount: numAmount,
      type,
      category,
      account_id: accountId,
      note: note || null,
      date,
    };

    if (transaction) {
      updateMutation.mutate(
        { id: transaction.id, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-md mx-auto pb-10">
        <SheetHeader>
          <SheetTitle>{transaction ? "Edit" : "Add"} Transaction</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Type toggle */}
          <div className="flex gap-2 bg-muted rounded-xl p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  type === t
                    ? t === "income"
                      ? "bg-income text-income-foreground"
                      : "bg-expense text-expense-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <Input
            type="number"
            placeholder="Amount (MAD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 text-lg font-bold bg-card"
          />

          {/* Account */}
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full h-12 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>

          {/* Category */}
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors border",
                  category === cat.id
                    ? "border-primary bg-primary/10"
                    : "border-transparent bg-muted"
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[10px] truncate w-full text-center text-foreground">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Date */}
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 bg-card"
          />

          {/* Note */}
          <Input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-12 bg-card"
          />

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : transaction ? "Update" : "Add Transaction"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
