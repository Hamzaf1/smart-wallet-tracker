import * as XLSX from "xlsx";

export interface ParsedTransaction {
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string;
}

// Keyword-based auto-categorization
const CATEGORY_RULES: [RegExp, string][] = [
  [/\b(bim|marjane|carrefour|acima|label.?vie|aswak|atacadao)\b/i, "Food"],
  [/\b(tramway|tram|oncf|train|taxi|uber|carburant|shell|afriquia|total|station|parking)\b/i, "Transport"],
  [/\b(iam|inwi|orange|lydec|amendis|redal|radeef|eau|electricit|internet|wifi)\b/i, "Bills"],
  [/\b(zara|h&m|lc waikiki|decathlon|kiabi|jumia|mode|vetement)\b/i, "Shopping"],
  [/\b(pharmacie|medecin|clinique|hopital|dentist|labo)\b/i, "Health"],
  [/\b(loyer|rent|syndic|immobilier)\b/i, "Housing"],
  [/\b(restaurant|cafe|starbucks|mcdonald|burger|pizza|snack)\b/i, "Dining"],
  [/\b(ecole|universite|formation|cours|scolarite)\b/i, "Education"],
  [/\b(salaire|salary|virement|recu|received)\b/i, "Salary"],
  [/\b(transfer|envoi|retrait|dab|gab|atm|withdrawal)\b/i, "Transfer"],
];

function categorize(description: string): string {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(description)) return category;
  }
  return "Other";
}

function parseDate(raw: string | number): string {
  if (typeof raw === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(raw);
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const str = String(raw).trim();
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    const year = dmy[3].length === 2 ? "20" + dmy[3] : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  }
  // Fallback: try Date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return new Date().toISOString().split("T")[0];
}

function parseAmount(raw: string | number): number {
  if (typeof raw === "number") return raw;
  // Handle French number format: 1.234,56 or 1 234,56
  let str = String(raw).trim().replace(/\s/g, "");
  // If has comma as decimal separator
  if (str.includes(",") && !str.includes(".")) {
    str = str.replace(",", ".");
  } else if (str.includes(",") && str.includes(".")) {
    // 1.234,56 format
    str = str.replace(/\./g, "").replace(",", ".");
  }
  str = str.replace(/[^0-9.\-+]/g, "");
  return parseFloat(str) || 0;
}

// Detect header row by looking for date/amount keywords
function findHeaderRow(rows: any[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const joined = rows[i].map((c) => String(c || "").toLowerCase()).join(" ");
    if (
      (joined.includes("date") || joined.includes("تاريخ")) &&
      (joined.includes("montant") || joined.includes("amount") || joined.includes("debit") || joined.includes("credit") || joined.includes("مبلغ"))
    ) {
      return i;
    }
  }
  return 0;
}

function findColumn(headers: string[], ...keywords: string[]): number {
  return headers.findIndex((h) => {
    const lower = h.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  });
}

export function parseBankStatement(file: File): Promise<{ transactions: ParsedTransaction[]; bankName: string; warnings: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (rows.length < 2) {
          reject(new Error("File is empty or has no data rows"));
          return;
        }

        const headerIdx = findHeaderRow(rows);
        const headers = rows[headerIdx].map((h: any) => String(h || "").trim());
        const dataRows = rows.slice(headerIdx + 1).filter((r) => r.some((c: any) => c !== "" && c != null));

        // Detect bank format
        const joinedHeaders = headers.join(" ").toLowerCase();
        const fileName = file.name.toLowerCase();
        let bankName = "Unknown Bank";

        // Bank detection rules: [headerKeywords[], fileKeywords[], bankName, extraSetup?]
        const BANK_DETECTORS: { name: string; headers: string[]; file: string[] }[] = [
          { name: "CIH Bank", headers: ["cih", "date opération", "date comptable"], file: ["cih"] },
          { name: "Barid Bank", headers: ["barid", "al barid", "بريد"], file: ["barid"] },
          { name: "Attijariwafa Bank", headers: ["attijariwafa", "attijari", "awb", "wafabank"], file: ["attijariwafa", "attijari", "awb"] },
          { name: "BMCE Bank", headers: ["bmce", "bank of africa", "boa"], file: ["bmce", "boa", "bank_of_africa", "bankofafrica"] },
          { name: "Banque Populaire", headers: ["banque populaire", "bp", "chaabi", "bcp"], file: ["populaire", "chaabi", "bcp"] },
          { name: "Société Générale Maroc", headers: ["société générale", "societe generale", "sgmb", "sg maroc"], file: ["societe_generale", "sgmb", "sg_maroc", "sgmaroc"] },
          { name: "BMCI", headers: ["bmci", "bnp paribas"], file: ["bmci"] },
          { name: "Bank of Africa", headers: ["bank of africa", "boa", "bmce"], file: ["bank_of_africa", "bankofafrica"] },
          { name: "Banque Centrale Populaire", headers: ["centrale populaire", "bcp"], file: ["bcp", "centrale_populaire"] },
        ];

        for (const bank of BANK_DETECTORS) {
          if (bank.headers.some((k) => joinedHeaders.includes(k))) { bankName = bank.name; break; }
        }
        if (bankName === "Unknown Bank") {
          for (const bank of BANK_DETECTORS) {
            if (bank.file.some((k) => fileName.includes(k))) { bankName = bank.name; break; }
          }
        }

        // Bank-specific column overrides
        if (bankName === "Attijariwafa Bank") {
          if (dateCol === -1) dateCol = findColumn(headers, "date valeur", "date op");
          if (descCol === -1) descCol = findColumn(headers, "libellé", "nature", "opération");
        } else if (bankName === "Société Générale Maroc" || bankName === "BMCI") {
          if (dateCol === -1) dateCol = findColumn(headers, "date comptable", "date valeur");
          if (descCol === -1) descCol = findColumn(headers, "libellé opération", "nature opération");
        } else if (bankName === "Banque Populaire" || bankName === "Banque Centrale Populaire") {
          if (dateCol === -1) dateCol = findColumn(headers, "date opération", "date mouvement");
          if (descCol === -1) descCol = findColumn(headers, "nature", "libellé");
        }

        if (dateCol === -1) dateCol = 0;
        if (descCol === -1) descCol = Math.min(1, headers.length - 1);

        const hasDebitCredit = debitCol !== -1 && creditCol !== -1;
        if (!hasDebitCredit && amountCol === -1) {
          // Try last numeric column as amount
          amountCol = headers.length - 1;
        }

        const warnings: string[] = [];
        const transactions: ParsedTransaction[] = [];

        for (const row of dataRows) {
          const dateRaw = row[dateCol];
          if (!dateRaw && dateRaw !== 0) continue;

          const date = parseDate(dateRaw);
          const desc = String(row[descCol] || "").trim();

          let amount: number;
          let type: "income" | "expense";

          if (hasDebitCredit) {
            const debit = parseAmount(row[debitCol]);
            const credit = parseAmount(row[creditCol]);
            if (Math.abs(credit) > 0) {
              amount = Math.abs(credit);
              type = "income";
            } else if (Math.abs(debit) > 0) {
              amount = Math.abs(debit);
              type = "expense";
            } else {
              continue; // Skip zero rows
            }
          } else {
            amount = parseAmount(row[amountCol]);
            if (amount === 0) continue;
            type = amount > 0 ? "income" : "expense";
            amount = Math.abs(amount);
          }

          const category = categorize(desc);
          transactions.push({ date, amount, type, category, note: desc });
        }

        if (transactions.length === 0) {
          warnings.push("No valid transactions found. Please check the file format.");
        }

        resolve({ transactions, bankName, warnings });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
