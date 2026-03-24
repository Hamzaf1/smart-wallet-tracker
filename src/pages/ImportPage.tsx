import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccounts } from "@/hooks/useFinanceData";
import { parseBankStatement, type ParsedTransaction } from "@/lib/bankParsers";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, ArrowLeft, Check, X, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ImportPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: accounts } = useAccounts();

  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState("");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState({ imported: 0, skipped: 0 });
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    try {
      const result = await parseBankStatement(f);
      setTransactions(result.transactions);
      setBankName(result.bankName);
      setWarnings(result.warnings);
      setStep("preview");

      // Auto-select account matching bank name
      if (accounts) {
        const match = accounts.find((a) => 
          a.name.toLowerCase().includes(result.bankName.toLowerCase().split(" ")[0])
        );
        if (match) setSelectedAccountId(match.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to parse file");
    }
  }, [accounts]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const removeTransaction = (idx: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImport = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }
    setImporting(true);
    setStep("importing");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const inserts = transactions.map((t) => ({
        user_id: user.id,
        account_id: selectedAccountId,
        amount: t.amount,
        type: t.type,
        category: t.category,
        note: t.note,
        date: new Date(t.date).toISOString(),
      }));

      // Insert in batches of 50
      let imported = 0;
      for (let i = 0; i < inserts.length; i += 50) {
        const batch = inserts.slice(i, i + 50);
        const { error } = await supabase.from("transactions").insert(batch);
        if (error) throw error;
        imported += batch.length;
      }

      setImportResult({ imported, skipped: 0 });
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-stats"] });
      toast.success(`${imported} transactions imported!`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setTransactions([]);
    setWarnings([]);
    setBankName("");
    setSelectedAccountId("");
  };

  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Import Statement</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Upload bank statement</h2>
                <p className="text-sm text-muted-foreground">
                  Supports CIH Bank and Barid Bank CSV/Excel files. Transactions will be auto-categorized.
                </p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Tap to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV, XLS, XLSX files supported
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Supported banks */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Supported banks</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "CIH Bank", color: "#e11d48" },
                    { name: "Barid Bank", color: "#f59e0b" },
                  ].map((bank) => (
                    <div
                      key={bank.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bank.color + "20" }}
                      >
                        <FileSpreadsheet className="h-4 w-4" style={{ color: bank.color }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{bank.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              {/* File info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bankName} · {transactions.length} transactions
                  </p>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-destructive p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-chart-3/10 border border-chart-3/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                    <div className="text-xs text-chart-3">
                      {warnings.map((w, i) => <p key={i}>{w}</p>)}
                    </div>
                  </div>
                </div>
              )}

              {/* Account selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Import to account</label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="h-12 rounded-xl bg-card border-border/50">
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-income/10 border border-income/20">
                  <p className="text-xs text-income font-medium">{incomeCount} income</p>
                  <p className="text-lg font-bold text-income">+{totalIncome.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-expense/10 border border-expense/20">
                  <p className="text-xs text-expense font-medium">{expenseCount} expenses</p>
                  <p className="text-lg font-bold text-expense">-{totalExpense.toFixed(2)}</p>
                </div>
              </div>

              {/* Transaction list */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {transactions.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/30"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === "income" ? "bg-income" : "bg-expense"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{t.note || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{t.date} · {t.category}</p>
                    </div>
                    <span className={`text-xs font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                      {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)}
                    </span>
                    <button onClick={() => removeTransaction(i)} className="text-muted-foreground hover:text-destructive p-0.5">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  className="w-full h-[52px] rounded-xl text-[15px] font-semibold bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20"
                  disabled={transactions.length === 0 || !selectedAccountId}
                  onClick={handleImport}
                >
                  Import {transactions.length} Transactions
                </Button>
                <Button variant="ghost" className="w-full h-11 text-sm text-muted-foreground" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Importing */}
          {step === "importing" && (
            <motion.div
              key="importing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full"
              />
              <p className="text-sm font-medium text-foreground">Importing transactions...</p>
              <p className="text-xs text-muted-foreground">This may take a moment</p>
            </motion.div>
          )}

          {/* STEP 4: Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-income/10 flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-income" />
              </motion.div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">Import Complete!</h2>
                <p className="text-sm text-muted-foreground">
                  {importResult.imported} transactions imported successfully
                </p>
              </div>
              <div className="space-y-3 w-full">
                <Button
                  className="w-full h-[52px] rounded-xl text-[15px] font-semibold"
                  onClick={() => navigate("/transactions")}
                >
                  View Transactions
                </Button>
                <Button variant="outline" className="w-full h-11 rounded-xl" onClick={reset}>
                  Import Another File
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
