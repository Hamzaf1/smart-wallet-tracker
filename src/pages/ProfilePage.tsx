import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Moon, Sun, Target, RefreshCw, PiggyBank, TrendingUp, Car, Upload, Globe, Fingerprint, Shield, Download, FileText, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n, Lang } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useInactivityLock } from "@/hooks/useInactivityLock";
import { useTransactions, useMonthlyStats, useAccounts } from "@/hooks/useFinanceData";
import { exportTransactionsCSV, exportSummaryPDF } from "@/lib/exportUtils";
import { useProfile } from "@/hooks/useProfile";
import { EditProfileSheet } from "@/components/EditProfileSheet";

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
  const [autoLock, setAutoLock] = useState(() => localStorage.getItem("auto_lock") === "true");
  const [editOpen, setEditOpen] = useState(false);
  const { isAvailable: bioAvailable, isEnabled: bioEnabled, toggleBiometric } = useBiometricAuth();
  useInactivityLock(autoLock);
  const { data: transactions = [] } = useTransactions();
  const { data: stats } = useMonthlyStats();
  const { data: accounts = [] } = useAccounts();
  const { data: profile } = useProfile();

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
        <h1 className="text-xl font-bold text-foreground font-display">{t("profile")}</h1>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-5 border border-border/50 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                <User className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate">
              {profile?.display_name || "User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Pencil className="h-4 w-4 text-primary" />
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <item.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}

          {/* Language Switcher */}
          <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
              <Globe className="h-4.5 w-4.5 text-primary" />
            </div>
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

          {/* Biometric Lock */}
          {bioAvailable && (
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <Fingerprint className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">Face ID / Touch ID</span>
              <Switch checked={bioEnabled} onCheckedChange={toggleBiometric} />
            </div>
          )}

          {/* Auto-Lock */}
          <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">Auto-lock (5 min)</span>
            <Switch checked={autoLock} onCheckedChange={(v) => { setAutoLock(v); localStorage.setItem("auto_lock", String(v)); }} />
          </div>

          {/* Export */}
          <button
            onClick={() => exportTransactionsCSV(transactions)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
              <Download className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Export CSV</span>
          </button>
          <button
            onClick={() => exportSummaryPDF({
              totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
              monthlyIncome: stats?.total_income ?? 0,
              monthlyExpense: stats?.total_expense ?? 0,
              transactions,
            })}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
              <FileText className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Export PDF Report</span>
          </button>

          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
              {dark ? <Moon className="h-4.5 w-4.5 text-primary" /> : <Sun className="h-4.5 w-4.5 text-primary" />}
            </div>
            <span className="text-sm font-medium text-foreground">
              {dark ? t("dark_mode") : t("light_mode")}
            </span>
          </button>
        </div>

        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
        </Button>
      </div>

      <EditProfileSheet open={editOpen} onOpenChange={setEditOpen} />
    </AppLayout>
  );
}
