import { Transaction } from "@/lib/types";

export function exportTransactionsCSV(transactions: Transaction[]) {
  const headers = ["Date", "Type", "Category", "Amount", "Account", "Note"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    t.amount.toString(),
    t.accounts?.name || "",
    t.note || "",
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fintrack-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSummaryPDF(data: {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: Transaction[];
}) {
  // Generate a simple HTML-based printable report
  const html = `
<!DOCTYPE html>
<html><head><title>FinTrack Report</title>
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
  <h1>FinTrack Monthly Report</h1>
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
      ${data.transactions.slice(0, 50).map((t) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>${t.category}</td>
          <td class="${t.type}">${t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)} MAD</td>
          <td>${t.note || "-"}</td>
        </tr>`).join("")}
    </tbody>
  </table>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}