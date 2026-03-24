import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ImportPage from "./pages/ImportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setNeedsOnboarding(false);
      return;
    }

    // Check if onboarding was already completed locally
    if (localStorage.getItem("onboarding_complete") === "true") {
      setNeedsOnboarding(false);
      return;
    }

    // Check if user has any accounts
    supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count && count > 0) {
          localStorage.setItem("onboarding_complete", "true");
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true);
        }
      });
  }, [session]);

  if (!session) return <Navigate to="/login" replace />;
  if (needsOnboarding === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);
  return null;
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/onboarding" element={session ? <OnboardingPage /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<AuthGuard session={session}><DashboardPage /></AuthGuard>} />
      <Route path="/transactions" element={<AuthGuard session={session}><TransactionsPage /></AuthGuard>} />
      <Route path="/accounts" element={<AuthGuard session={session}><AccountsPage /></AuthGuard>} />
      <Route path="/import" element={<AuthGuard session={session}><ImportPage /></AuthGuard>} />
      <Route path="/profile" element={<AuthGuard session={session}><ProfilePage /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <ThemeInit />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
