import { Transaction } from "@/lib/types";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toast } from "sonner";

async function saveAndShare(filename: string, content: string, mimeType: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: filename,
        url: res.uri,
        dialogTitle: "Export",
      });
    } catch (e: any) {
      toast.error("Could not export file: " + (e?.message || "unknown error"));
    }
  } else {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function exportTransactionsCSV(transactions: Transaction[]) {
  if (!transactions.length) {
    toast.error("No transactions to export");
    return;
  }
  const headers = ["Date", "Type", "Category", "Amount", "Account", "Note"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    t.amount.toString(),
    t.accounts?.name || "",
    (t.note || "").replace(/"/g, '""'),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const filename = `mizan-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  await saveAndShare(filename, csv, "text/csv");
}

export async function exportSummaryPDF(data: {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: Transaction[];
}) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Mizan Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #1a1a1a; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .subtitle { color: #666; margin-bottom: 24px; }
  .summary { display: flex; gap: 24px; margin-bottom: 32px; }
  .card { background: #f5f5f5; border-radius: 12px; padding: 16px 20px; flex: 1; }
  .card-label { font-size: 12px; color: #888; text-transform: uppercase; }
  .card-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .income { color: #22c55e; }
  .expense { color: #ef4444; }
</style></head><body>
  <h1>Mizan Monthly Report</h1>
  <p class="subtitle">${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
  <div class="summary">
    <div class="card"><div class="card-label">Balance</div><div class="card-value">${data.totalBalance.toFixed(2)} MAD</div></div>
    <div class="card"><div class="card-label">Income</div><div class="card-value income">+${data.monthlyIncome.toFixed(2)} MAD</div></div>
    <div class="card"><div class="card-label">Expenses</div><div class="card-value expense">-${data.monthlyExpense.toFixed(2)} MAD</div></div>
  </div>
  <h2 style="font-size:16px; margin-bottom:12px;">Transactions</h2>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
    <tbody>
      ${data.transactions.slice(0, 100).map((t) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>${t.category}</td>
          <td class="${t.type}">${t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)} MAD</td>
          <td>${(t.note || "-").replace(/</g, "&lt;")}</td>
        </tr>`).join("")}
    </tbody>
  </table>
</body></html>`;

  if (Capacitor.isNativePlatform()) {
    // Native can't print() — share the HTML file; user can open in browser to print/save as PDF
    const filename = `mizan-report-${new Date().toISOString().slice(0, 10)}.html`;
    await saveAndShare(filename, html, "text/html");
    toast.info("Open the file in a browser to save as PDF");
  } else {
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Pop-ups are blocked. Please allow pop-ups to export.");
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}
