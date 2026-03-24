import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/useFinanceData";
import { AccountSheet } from "@/components/AccountSheet";
import type { Account } from "@/lib/types";

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Accounts</h1>
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
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse h-24" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-card rounded-xl p-10 border border-border text-center">
            <p className="text-muted-foreground">No accounts yet</p>
            <Button
              className="mt-4"
              onClick={() => { setEditing(null); setSheetOpen(true); }}
            >
              Add your first account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => { setEditing(acc); setSheetOpen(true); }}
                className="w-full text-left bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: acc.color + "20" }}
                  >
                    {acc.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">Tap to edit</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {acc.balance.toLocaleString("en-US", {
                      style: "currency",
                      currency: "MAD",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AccountSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        account={editing}
      />
    </AppLayout>
  );
}
