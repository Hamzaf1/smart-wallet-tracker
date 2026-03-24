import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun, Target, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return { ...data, email: user.email };
    },
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>

        <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {profile?.display_name || "User"}
            </p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            {dark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span className="text-sm font-medium text-foreground">
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        </div>

        <Button
          variant="destructive"
          className="w-full h-12"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </AppLayout>
  );
}
