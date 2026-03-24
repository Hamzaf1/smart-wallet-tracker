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
};

export const ACCOUNT_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)",
  "hsl(0, 84%, 60%)",
  "hsl(200, 80%, 50%)",
];
