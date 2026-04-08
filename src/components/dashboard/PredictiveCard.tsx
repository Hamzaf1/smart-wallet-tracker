import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  prediction: { predictedBalance: number; daysLeft: number; dailySpendRate: number };
}

export function PredictiveCard({ prediction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border/50 space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Predicted End-of-Month</p>
          <p className={`text-lg font-bold font-display ${prediction.predictedBalance >= 0 ? "text-income" : "text-expense"}`}>
            {prediction.predictedBalance.toLocaleString("en-US", { style: "currency", currency: "MAD" })}
          </p>
        </div>
      </div>
      <div className="flex gap-4 text-[11px] text-muted-foreground">
        <span>{prediction.daysLeft} days left</span>
        <span>~{prediction.dailySpendRate.toFixed(0)} MAD/day</span>
      </div>
    </motion.div>
  );
}
