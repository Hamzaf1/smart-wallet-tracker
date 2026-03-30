import { Home, ArrowLeftRight, Wallet, User, MoreHorizontal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const tabs = [
  { path: "/", icon: Home, key: "home" },
  { path: "/transactions", icon: ArrowLeftRight, key: "activity" },
  { path: "/accounts", icon: Wallet, key: "accounts" },
  { path: "/profile", icon: MoreHorizontal, key: "more" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useI18n((s) => s.t);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{t(tab.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
