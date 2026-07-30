// Admin CRUD endpoint for the transactions ledger.
// Protected by the ADMIN_TXN_PASSWORD secret (sent as `x-admin-password`).
// Uses the service role so the underlying table stays locked to anon.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("ADMIN_TXN_PASSWORD") || "";
  const provided = req.headers.get("x-admin-password") || "";
  if (!expected || provided !== expected) return json({ error: "Unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = String(payload.action || "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const rowFrom = (r: Record<string, unknown>) => ({
    amount: Number(r.amount) || 0,
    transaction_type: r.transaction_type === "credit" ? "credit" : "debit",
    sender_name: (r.sender_name as string) ?? null,
    transaction_reference: (r.transaction_reference as string) ?? null,
    bank_name: (r.bank_name as string) ?? null,
    account_number_last4: (r.account_number_last4 as string) ?? null,
    message: (r.message as string) ?? null,
    transaction_date: (r.transaction_date as string) || new Date().toISOString(),
  });

  try {
    if (action === "create") {
      const row = rowFrom((payload.row || {}) as Record<string, unknown>);
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...row, sms_sender: "ADMIN", raw_sms: null })
        .select()
        .single();
      if (error) throw error;
      return json({ transaction: data });
    }
    if (action === "update") {
      const id = String(payload.id || "");
      if (!id) return json({ error: "Missing id" }, 400);
      const row = rowFrom((payload.row || {}) as Record<string, unknown>);
      const { data, error } = await supabase
        .from("transactions")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return json({ transaction: data });
    }
    if (action === "delete") {
      const id = String(payload.id || "");
      if (!id) return json({ error: "Missing id" }, 400);
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
