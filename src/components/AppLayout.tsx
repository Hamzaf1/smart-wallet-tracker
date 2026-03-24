import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <main className="pb-20 safe-top">{children}</main>
      <BottomNav />
    </div>
  );
}
