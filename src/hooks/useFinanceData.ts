import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import type { Account, Transaction, MonthlyStats } from "@/lib/types";

const API = import.meta.env.VITE_API_URL || "";

function useApi() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const fetchApi = async (path: string, options?: RequestInit) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });
    if (res.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  return fetchApi;
}

// ---- ACCOUNTS ----
export function useAccounts() {
  const fetchApi = useApi();
  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => fetchApi("/accounts"),
  });
}

export function useCreateAccount() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Account, "id" | "user_id" | "created_at">) =>
      fetchApi("/accounts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Account>) =>
      fetchApi(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// ---- TRANSACTIONS ----
export function useTransactions() {
  const fetchApi = useApi();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => fetchApi("/transactions"),
  });
}

export function useCreateTransaction() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Transaction, "id" | "user_id" | "created_at" | "accounts">) =>
      fetchApi("/transactions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["monthly-stats"] });
    },
  });
}

export function useUpdateTransaction() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Transaction>) =>
      fetchApi(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["monthly-stats"] });
    },
  });
}

export function useDeleteTransaction() {
  const fetchApi = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["monthly-stats"] });
    },
  });
}

// ---- STATS ----
export function useMonthlyStats() {
  const fetchApi = useApi();
  return useQuery<MonthlyStats>({
    queryKey: ["monthly-stats"],
    queryFn: () => fetchApi("/transactions/stats"),
  });
}
