import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { CategoryIcon } from "@/components/CategoryIcon";

interface Transaction {
  id: string;
  category: string;
  type: string;
  amount: number;
  date: string;
  accounts?: { name: string } | null;
}

interface Props {
  transactions: Transaction[];
  onSeeAll: () => void;
}

export function RecentTransactions({ transactions, onSeeAll }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground font-display">Recent Transactions</h2>
        <button onClick={onSeeAll} className="text-primary text-xs font-medium flex items-center gap-1">
          See all <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-center">
          <p className="text-muted-foreground text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const cat = CATEGORIES.find((c) => c.id === tx.category);
            return (
              <div key={tx.id} className="flex items-center gap-3 bg-card rounded-2xl p-3.5 border border-border/50">
                <CategoryIcon category={tx.category} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cat?.label || tx.category}</p>
                  <p className="text-xs text-muted-foreground">{tx.accounts?.name} · {new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-bold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                  {tx.type === "income" ? "+" : "-"}{Math.abs(tx.amount).toLocaleString("en-US", { style: "currency", currency: "MAD" })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
