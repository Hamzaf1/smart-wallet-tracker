import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun, Target, RefreshCw, PiggyBank, TrendingUp, Car, Upload, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n, Lang } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
  { value: "es", label: "Español" },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
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

  const menuItems = [
    { icon: Target, label: t("budget"), path: "/budget" },
    { icon: RefreshCw, label: t("recurring"), path: "/recurring" },
    { icon: PiggyBank, label: t("savings"), path: "/savings" },
    { icon: TrendingUp, label: t("investments"), path: "/investments" },
    { icon: Car, label: t("car_expenses"), path: "/car-expenses" },
    { icon: Upload, label: t("import"), path: "/import" },
  ];

  return (
    <AppLayout>
      <div className="px-5 pt-6 space-y-6 pb-24">
        <h1 className="text-xl font-bold text-foreground">{t("profile")}</h1>

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
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}

          {/* Language Switcher */}
          <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground flex-1">{t("language")}</span>
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            {dark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span className="text-sm font-medium text-foreground">
              {dark ? t("dark_mode") : t("light_mode")}
            </span>
          </button>
        </div>

        <Button
          variant="destructive"
          className="w-full h-12"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
        </Button>
      </div>
    </AppLayout>
  );
}
