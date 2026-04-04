import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user financial context
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    const [accountsRes, txThisMonth, txLastMonth, budgetsRes, savingsRes, recurringRes] = await Promise.all([
      supabase.from("accounts").select("name, balance, icon"),
      supabase.from("transactions").select("amount, type, category, date, note").gte("date", monthStart).lte("date", monthEnd).order("date", { ascending: false }).limit(200),
      supabase.from("transactions").select("amount, type, category").gte("date", lastMonthStart).lte("date", lastMonthEnd),
      supabase.from("budgets").select("category, amount, month").eq("month", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`),
      supabase.from("savings_goals").select("name, target_amount, current_amount"),
      supabase.from("recurring_transactions").select("amount, type, category, frequency, is_active").eq("is_active", true),
    ]);

    const accounts = accountsRes.data || [];
    const thisMonthTx = txThisMonth.data || [];
    const lastMonthTx = txLastMonth.data || [];
    const budgets = budgetsRes.data || [];
    const savings = savingsRes.data || [];
    const recurring = recurringRes.data || [];

    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
    const thisIncome = thisMonthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const thisExpense = thisMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const lastIncome = lastMonthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const lastExpense = lastMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    // Category breakdown
    const catBreakdown: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === "expense").forEach(t => {
      catBreakdown[t.category] = (catBreakdown[t.category] || 0) + Number(t.amount);
    });
    const topCategories = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const systemPrompt = `You are a smart, friendly financial assistant for a Moroccan finance tracking app. Currency is MAD (Moroccan Dirham). Be concise, practical, and supportive.

USER'S FINANCIAL SNAPSHOT:
- Total balance across all accounts: ${totalBalance.toFixed(2)} MAD
- Accounts: ${accounts.map(a => `${a.icon} ${a.name}: ${Number(a.balance).toFixed(2)} MAD`).join(", ") || "None"}

THIS MONTH:
- Income: ${thisIncome.toFixed(2)} MAD
- Expenses: ${thisExpense.toFixed(2)} MAD
- Net: ${(thisIncome - thisExpense).toFixed(2)} MAD
- Top spending categories: ${topCategories.map(([cat, val]) => `${cat}: ${val.toFixed(0)} MAD`).join(", ") || "No expenses yet"}

LAST MONTH:
- Income: ${lastIncome.toFixed(2)} MAD | Expenses: ${lastExpense.toFixed(2)} MAD

BUDGETS THIS MONTH:
${budgets.length ? budgets.map(b => {
  const spent = catBreakdown[b.category] || 0;
  return `- ${b.category}: ${spent.toFixed(0)}/${Number(b.amount).toFixed(0)} MAD (${Math.round((spent / Number(b.amount)) * 100)}%)`;
}).join("\n") : "No budgets set"}

SAVINGS GOALS:
${savings.length ? savings.map(s => `- ${s.name}: ${Number(s.current_amount).toFixed(0)}/${Number(s.target_amount).toFixed(0)} MAD`).join("\n") : "No savings goals"}

RECURRING TRANSACTIONS:
${recurring.length ? recurring.map(r => `- ${r.category} (${r.type}): ${Number(r.amount).toFixed(0)} MAD/${r.frequency}`).join("\n") : "None"}

RECENT TRANSACTIONS (up to 10):
${thisMonthTx.slice(0, 10).map(t => `- ${t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(0)} MAD | ${t.category}${t.note ? ` | ${t.note}` : ""}`).join("\n") || "None"}

Guidelines:
- Answer in the same language the user writes in
- Use the data above to give personalized answers
- When giving advice, be specific with numbers from their actual data
- If asked about trends, compare this month vs last month
- Keep responses concise (2-4 sentences unless detail is requested)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20), // last 20 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("finance-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
