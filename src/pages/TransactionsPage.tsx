import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useTransactions, useDeleteTransaction } from "@/hooks/useFinanceData";
import { TransactionSheet } from "@/components/TransactionSheet";
import type { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("Delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Transactions</h1>
          <Button
            size="sm"
            className="rounded-full h-9 gap-1"
            onClick={() => { setEditing(null); setSheetOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse h-16" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-card rounded-xl p-10 border border-border text-center">
            <p className="text-muted-foreground">No transactions yet</p>
            <Button
              className="mt-4"
              onClick={() => { setEditing(null); setSheetOpen(true); }}
            >
              Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const cat = CATEGORIES.find((c) => c.id === tx.category);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                >
                  <CategoryIcon category={tx.category} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {cat?.label || tx.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.accounts?.name} · {new Date(tx.date).toLocaleDateString()}
                    </p>
                    {tx.note && (
                      <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString("en-US", {
                        style: "currency",
                        currency: "MAD",
                      })}
                    </p>
                    <button
                      onClick={() => { setEditing(tx); setSheetOpen(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        transaction={editing}
      />
    </AppLayout>
  );
}
