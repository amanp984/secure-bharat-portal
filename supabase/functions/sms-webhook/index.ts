// Public SMS ingestion webhook — receives forwarded banking SMS from an
// Android SMS Forwarder app and writes a row into public.transactions.
//
// Auth: caller MUST supply the shared secret via ONE of:
//   - Header  x-webhook-secret: <secret>
//   - Header  authorization: Bearer <secret>
//   - Query   ?secret=<secret>
//
// Body (application/json), any of these field names accepted:
//   { "from": "VK-HDFCBK", "text": "Rs.500 credited to A/c XX1234 ... UTR 123456789012" }
//   { "sender": "...",     "message": "..." }
//   { "address": "...",    "body": "..." }
//
// Response 200: { success: true, id, parsed }
// Response 200 (ignored): { success: true, ignored: true, reason, parsed }
// Response 200 (duplicate UTR): { success: true, duplicate: true, id, parsed }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

type TxnType = "credit" | "debit";

interface ParsedSms {
  amount: number;
  transaction_type: TxnType;
  sender_name: string | null;
  transaction_reference: string | null;
  bank_name: string | null;
  account_number_last4: string | null;
}

function parseSms(text: string, smsSender?: string | null): ParsedSms {
  const t = (text || "").trim();
  const lower = t.toLowerCase();

  const creditWords = /(credited|received|deposit(ed)?|salary|refund|added)/i;
  const debitWords =
    /(debited|withdrawn|debit|spent|paid|purchase|payment of|sent|transferred)/i;
  let transaction_type: TxnType = "debit";
  if (creditWords.test(t) && !debitWords.test(t)) transaction_type = "credit";
  else if (debitWords.test(t) && !creditWords.test(t)) transaction_type = "debit";
  else if (creditWords.test(t)) transaction_type = "credit";

  let amount = 0;
  const amtMatch =
    t.match(/(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i) ||
    t.match(/\b([0-9][0-9,]*\.\d{2})\b/);
  if (amtMatch) amount = parseFloat(amtMatch[1].replace(/,/g, "")) || 0;

  let account_number_last4: string | null = null;
  const cpAcc =
    t.match(/(?:to|from)\s+[A-Za-z][A-Za-z0-9 &.'_\-]{1,60}?\s+(?:a\/?c|account|ac)[^0-9xX*]{0,8}[xX*]+\s*(\d{4})/i) ||
    t.match(/(?:to|from)\s+(?:a\/?c|account|ac)[^0-9xX*]{0,8}[xX*]+\s*(\d{4})/i);
  if (cpAcc) {
    account_number_last4 = cpAcc[1];
  } else {
    const acc =
      t.match(/(?:a\/?c|account|ac)[^0-9xX*]{0,15}[xX*]+\s*(\d{4})/i) ||
      t.match(/[xX*]{2,}\s*(\d{4})/);
    if (acc) account_number_last4 = acc[1];
  }

  let transaction_reference: string | null = null;
  const ref =
    t.match(
      /\b(?:utr|rrn|ref(?:erence)?(?:\s*no\.?|#)?|txn(?:\s*id)?|upi(?:\s*ref)?)\s*[:#]?\s*([A-Z0-9]{6,})/i,
    ) || t.match(/\b([0-9]{10,16})\b/);
  if (ref) transaction_reference = ref[1];

  let bank_name: string | null = null;
  const banks = [
    ["hdfc", "HDFC Bank"],
    ["icici", "ICICI Bank"],
    ["sbi", "State Bank of India"],
    ["axis", "Axis Bank"],
    ["kotak", "Kotak Bank"],
    ["yes bank", "Yes Bank"],
    ["indusind", "IndusInd Bank"],
    ["pnb", "Punjab National Bank"],
    ["bob", "Bank of Baroda"],
    ["canara", "Canara Bank"],
    ["union", "Union Bank"],
    ["idfc", "IDFC First"],
    ["indian bank", "Indian Bank"],
  ] as const;
  for (const [needle, name] of banks) {
    if (lower.includes(needle)) { bank_name = name; break; }
  }
  if (!bank_name && smsSender) {
    const s = smsSender.toLowerCase();
    for (const [needle, name] of banks) {
      if (s.includes(needle.replace(/\s/g, ""))) { bank_name = name; break; }
    }
  }

  let sender_name: string | null = null;
  const stop = /(?=[.,]|\s+(?:a\/?c|account|ac|on|dated|via|ref|utr|rrn|imps|neft|upi|rtgs|avl|bal)\b)/i;
  const nameMatch =
    (transaction_type === "debit"
      ? t.match(new RegExp(`\\bto\\s+([A-Z][A-Za-z][A-Za-z .'&\\-]{1,50}?)${stop.source}`, "i"))
      : t.match(new RegExp(`\\b(?:from|by)\\s+([A-Z][A-Za-z][A-Za-z .'&\\-]{1,50}?)${stop.source}`, "i"))) ||
    t.match(/\b(?:from|by|to)\s+([A-Z][A-Za-z][A-Za-z .'&\-]{1,50})/) ||
    t.match(/vpa\s+([a-z0-9._\-]+@[a-z]+)/i);
  if (nameMatch) {
    sender_name = nameMatch[1]
      .replace(/\b(on|dated|ref|via|upi|imps|neft|rtgs|a\/?c|account|utr|rrn|avl|bal|with)\b.*$/i, "")
      .replace(/[\s.,;:/\-]+$/g, "")
      .trim();
    if (sender_name.length > 60) sender_name = sender_name.slice(0, 60);
    if (!sender_name) sender_name = null;
  }

  return {
    amount,
    transaction_type,
    sender_name,
    transaction_reference,
    bank_name,
    account_number_last4,
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { success: false, error: "Method not allowed" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SMS_WEBHOOK_SECRET = Deno.env.get("SMS_WEBHOOK_SECRET");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { success: false, error: "Server not configured (backend credentials missing)" });
  }
  if (!SMS_WEBHOOK_SECRET) {
    return json(500, { success: false, error: "Server not configured (SMS_WEBHOOK_SECRET missing)" });
  }

  // Auth
  const headerSecret =
    req.headers.get("x-webhook-secret") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret") || "";
  const provided = headerSecret || querySecret;
  if (!provided || provided !== SMS_WEBHOOK_SECRET) {
    return json(401, { success: false, error: "Unauthorized" });
  }

  // Body
  let body: Record<string, unknown> | null = null;
  try {
    const raw = await req.text();
    if (!raw) return json(400, { success: false, error: "Empty body" });
    try { body = JSON.parse(raw); } catch { body = { text: raw }; }
  } catch {
    return json(400, { success: false, error: "Invalid body" });
  }
  if (!body || typeof body !== "object") {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  const message = String(
    (body as any).text || (body as any).message || (body as any).body ||
    (body as any).sms || (body as any).content || "",
  );
  const smsSender: string | null =
    (body as any).from || (body as any).sender || (body as any).address || (body as any).phone || null;

  if (!message || message.length < 3) {
    return json(400, {
      success: false,
      error: "Missing SMS text (expected `text`, `message`, or `body` field)",
    });
  }
  if (message.length > 4000) return json(400, { success: false, error: "SMS too long" });

  const parsed = parseSms(message, smsSender);

  const txnKeyword =
    /(received\s+via\s+upi|sent\s+via\s+upi|received\s+via\s+imps|sent\s+via\s+imps|\bcredited\b|\bdebited\b|\bupi\b|\bimps\b|\bneft\b|\brtgs\b)/i;
  const hasAmount = parsed.amount > 0;
  const hasKeyword = txnKeyword.test(message);
  const hasReference = !!(parsed.transaction_reference && parsed.transaction_reference.length >= 6);
  if (!hasAmount || !hasKeyword || !hasReference) {
    return json(200, {
      success: true,
      ignored: true,
      reason: !hasAmount ? "no_amount" : !hasKeyword ? "no_transaction_keyword" : "no_utr_reference",
      parsed,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Dedupe by UTR
  if (parsed.transaction_reference) {
    const { data: existing, error: dupErr } = await supabase
      .from("transactions")
      .select("id")
      .eq("transaction_reference", parsed.transaction_reference)
      .limit(1)
      .maybeSingle();
    if (dupErr) return json(500, { success: false, error: dupErr.message });
    if (existing?.id) {
      return json(200, { success: true, duplicate: true, id: existing.id, parsed });
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount: parsed.amount,
      transaction_type: parsed.transaction_type,
      sender_name: parsed.sender_name,
      transaction_reference: parsed.transaction_reference,
      bank_name: parsed.bank_name,
      account_number_last4: parsed.account_number_last4,
      message,
      sms_sender: smsSender,
      raw_sms: message,
    })
    .select("id")
    .single();

  if (error) return json(500, { success: false, error: error.message });
  return json(200, { success: true, id: data?.id, parsed });
});
