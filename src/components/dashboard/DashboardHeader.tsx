import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import mizanLogo from "@/assets/mizan-logo.png";

interface Props {
  displayName: string;
  avatarUrl?: string | null;
}

export function DashboardHeader({ displayName, avatarUrl }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-md">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-bold font-display">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-muted-foreground text-xs">Welcome back,</p>
          <h1 className="text-lg font-bold text-foreground leading-tight font-display">{displayName} 👋</h1>
        </div>
      </div>
      <div className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center">
        <img src={mizanLogo} alt="Mizan" width={20} height={20} className="object-contain" />
      </div>
    </div>
  );
}
