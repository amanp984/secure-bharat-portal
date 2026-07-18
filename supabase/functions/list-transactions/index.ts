// Public read endpoint for the demo transactions ledger.
// Uses the service role so the underlying table can stay locked to anon.
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

  const PAGE = 1000;
  const all: unknown[] = [];
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
