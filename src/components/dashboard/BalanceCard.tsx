import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "MAD" });

export function BalanceCard({ totalBalance, monthlyIncome, monthlyExpense }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 text-primary-foreground shadow-xl shadow-primary/15">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent-foreground" />
      <div className="absolute top-[-50%] right-[-30%] w-[300px] h-[300px] rounded-full bg-primary-foreground/5 blur-2xl" />
      
      <div className="relative z-10">
        <p className="text-sm opacity-80 font-medium">Total Balance</p>
        <p className="text-3xl font-bold mt-1 font-display tracking-tight">{fmt(totalBalance)}</p>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] opacity-70">Income</p>
              <p className="text-sm font-semibold">{fmt(monthlyIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] opacity-70">Expenses</p>
              <p className="text-sm font-semibold">{fmt(monthlyExpense)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
