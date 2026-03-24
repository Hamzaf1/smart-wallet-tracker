export interface Account {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string | null;
  date: string;
  created_at: string;
  accounts?: { name: string };
}

export interface MonthlyStats {
  total_income: number;
  total_expense: number;
  category_totals: { category: string; total: number }[];
}
