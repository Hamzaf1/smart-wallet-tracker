import { Lightbulb, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface Insight {
  type: string;
  trend: string;
  message: string;
  detail?: string;
}

interface Props {
  insights: Insight[];
}

const trendIcon = (trend: string) => {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
};

const trendColor = (trend: string, type: string) => {
  if (type === "savings_rate" || type === "spending_trend") return trend === "up" ? "text-expense" : "text-income";
  return trend === "up" ? "text-expense" : trend === "down" ? "text-income" : "text-muted-foreground";
};

export function InsightsSection({ insights }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-chart-3" />
        <h2 className="text-base font-semibold text-foreground font-display">Insights</h2>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 bg-card rounded-2xl p-3.5 border border-border/50"
          >
            <div className={`mt-0.5 shrink-0 ${trendColor(insight.trend, insight.type)}`}>{trendIcon(insight.trend)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{insight.message}</p>
              {insight.detail && <p className="text-xs text-muted-foreground mt-0.5">{insight.detail}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
