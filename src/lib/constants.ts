export const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍔", color: "hsl(38, 92%, 50%)" },
  { id: "transport", label: "Transport", icon: "🚗", color: "hsl(217, 91%, 60%)" },
  { id: "bills", label: "Bills", icon: "📄", color: "hsl(0, 84%, 60%)" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "hsl(280, 67%, 60%)" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "hsl(142, 71%, 45%)" },
  { id: "health", label: "Health", icon: "💊", color: "hsl(350, 80%, 55%)" },
  { id: "education", label: "Education", icon: "📚", color: "hsl(200, 80%, 50%)" },
  { id: "salary", label: "Salary", icon: "💰", color: "hsl(142, 71%, 45%)" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "hsl(217, 91%, 60%)" },
  { id: "other", label: "Other", icon: "📌", color: "hsl(220, 10%, 50%)" },
] as const;

export const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  card: "💳",
  savings: "🏧",
  wallet: "👛",
};

export interface BankPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const MOROCCAN_BANKS: BankPreset[] = [
  { id: "cih", name: "CIH Bank", icon: "🏦", color: "hsl(210, 80%, 45%)" },
  { id: "barid", name: "Barid Bank", icon: "📮", color: "hsl(45, 90%, 50%)" },
  { id: "attijariwafa", name: "Attijariwafa Bank", icon: "🏛️", color: "hsl(25, 85%, 50%)" },
  { id: "bmce", name: "BMCE Bank", icon: "🔷", color: "hsl(210, 70%, 50%)" },
  { id: "bp", name: "Banque Populaire", icon: "🟠", color: "hsl(30, 90%, 55%)" },
  { id: "sgm", name: "Société Générale Maroc", icon: "🔴", color: "hsl(0, 80%, 50%)" },
  { id: "bmci", name: "BMCI", icon: "🟢", color: "hsl(140, 60%, 40%)" },
  { id: "boa", name: "Bank of Africa", icon: "🌍", color: "hsl(200, 70%, 45%)" },
  { id: "bcp", name: "Banque Centrale Populaire", icon: "🏦", color: "hsl(15, 80%, 50%)" },
  { id: "cash", name: "Cash", icon: "💵", color: "hsl(142, 71%, 45%)" },
  { id: "custom", name: "Custom", icon: "💳", color: "hsl(217, 91%, 60%)" },
];

export const ACCOUNT_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)",
  "hsl(0, 84%, 60%)",
  "hsl(200, 80%, 50%)",
];
