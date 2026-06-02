// Vercel Serverless Function — GET /api/transactions
// Returns the full demo-account transaction ledger.
//
// The underlying `transactions` table is no longer publicly readable via
// Supabase anon — all reads are funneled through this endpoint using the
// service role key. This endpoint backs the single demo dashboard.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: any, res: any) {
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const PAGE = 1000;
  const all: any[] = [];
  for (let i = 0; i < 50; i++) {
    const from = i * PAGE;
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, amount, transaction_type, sender_name, transaction_reference, bank_name, account_number_last4, message, sms_sender, raw_sms, transaction_date",
      )
      .order("transaction_date", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const rows = data || [];
    all.push(...rows);
    if (rows.length < PAGE) break;
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ transactions: all });
}
