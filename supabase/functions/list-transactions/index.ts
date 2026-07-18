// Public read endpoint for the demo transactions ledger.
// Uses the service role so the underlying table can stay locked to anon.
//
// Optional query params:
//   ?from=YYYY-MM-DD   inclusive lower bound on transaction_date
//   ?to=YYYY-MM-DD     inclusive upper bound on transaction_date (end of day)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const reqUrl = new URL(req.url);
  const from = reqUrl.searchParams.get("from"); // YYYY-MM-DD
  const to = reqUrl.searchParams.get("to");     // YYYY-MM-DD
  const fromIso = from ? `${from}T00:00:00.000Z` : null;
  const toIso = to ? `${to}T23:59:59.999Z` : null;

  const PAGE = 1000;
  const all: unknown[] = [];
  for (let i = 0; i < 50; i++) {
    const offset = i * PAGE;
    let q = supabase
      .from("transactions")
      .select(
        "id, amount, transaction_type, sender_name, transaction_reference, bank_name, account_number_last4, message, sms_sender, raw_sms, transaction_date",
      )
      .order("transaction_date", { ascending: false })
      .range(offset, offset + PAGE - 1);
    if (fromIso) q = q.gte("transaction_date", fromIso);
    if (toIso) q = q.lte("transaction_date", toIso);
    const { data, error } = await q;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const rows = data || [];
    all.push(...rows);
    if (rows.length < PAGE) break;
  }

  return new Response(JSON.stringify({ transactions: all }), {
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
