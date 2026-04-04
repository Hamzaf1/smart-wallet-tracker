import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { emoji: string; bg: string; shadow: string }> = {
  food:          { emoji: "🍽️", bg: "from-amber-400/20 to-orange-400/20", shadow: "shadow-amber-500/20" },
  transport:     { emoji: "🚕", bg: "from-blue-400/20 to-indigo-400/20", shadow: "shadow-blue-500/20" },
  bills:         { emoji: "⚡", bg: "from-red-400/20 to-rose-400/20", shadow: "shadow-red-500/20" },
  shopping:      { emoji: "🛍️", bg: "from-purple-400/20 to-fuchsia-400/20", shadow: "shadow-purple-500/20" },
  entertainment: { emoji: "🎬", bg: "from-emerald-400/20 to-teal-400/20", shadow: "shadow-emerald-500/20" },
  health:        { emoji: "💊", bg: "from-pink-400/20 to-rose-400/20", shadow: "shadow-pink-500/20" },
  education:     { emoji: "📚", bg: "from-cyan-400/20 to-sky-400/20", shadow: "shadow-cyan-500/20" },
  salary:        { emoji: "💰", bg: "from-green-400/20 to-emerald-400/20", shadow: "shadow-green-500/20" },
  freelance:     { emoji: "💻", bg: "from-indigo-400/20 to-blue-400/20", shadow: "shadow-indigo-500/20" },
  fuel:          { emoji: "⛽", bg: "from-amber-400/20 to-yellow-400/20", shadow: "shadow-amber-500/20" },
  maintenance:   { emoji: "🔧", bg: "from-slate-400/20 to-gray-400/20", shadow: "shadow-slate-500/20" },
  insurance:     { emoji: "🛡️", bg: "from-blue-400/20 to-cyan-400/20", shadow: "shadow-blue-500/20" },
  savings:       { emoji: "🐷", bg: "from-pink-400/20 to-fuchsia-400/20", shadow: "shadow-pink-500/20" },
  investments:   { emoji: "📈", bg: "from-green-400/20 to-teal-400/20", shadow: "shadow-green-500/20" },
  other:         { emoji: "📌", bg: "from-gray-400/20 to-slate-400/20", shadow: "shadow-gray-500/20" },
};

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;

  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-lg",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md",
        style.bg,
        style.shadow,
        sizeClasses[size],
        className
      )}
    >
      {style.emoji}
    </div>
  );
}
