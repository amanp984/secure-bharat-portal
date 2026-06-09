// Vercel Serverless Function — /api/sms
// Receives banking SMS payloads from an Android SMS Forwarder app,
// parses them, and stores the transaction in Supabase.
//
// Auth: requires the SMS_WEBHOOK_SECRET to be supplied via one of:
//   - Header `x-webhook-secret: <secret>`
//   - Header `authorization: Bearer <secret>`
//   - Query param `?secret=<secret>`
//
// Accepted JSON body shapes (any one):
//   { "from": "VK-HDFCBK", "text": "Rs.500 credited to A/c XX1234 ..." }
//   { "sender": "VK-HDFCBK", "message": "..." }
//   { "from": "VK-HDFCBK", "body": "..." }
//   { "address": "VK-HDFCBK", "body": "..." }
//
// Returns: { success: true, id, parsed } on success.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMS_WEBHOOK_SECRET = process.env.SMS_WEBHOOK_SECRET;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Webhook-Secret",
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

  // type
  const creditWords = /(credited|received|deposit(ed)?|salary|refund|added)/i;
  const debitWords =
    /(debited|withdrawn|debit|spent|paid|purchase|payment of|sent|transferred)/i;
  let transaction_type: TxnType = "debit";
  if (creditWords.test(t) && !debitWords.test(t)) transaction_type = "credit";
  else if (debitWords.test(t) && !creditWords.test(t)) transaction_type = "debit";
  else if (creditWords.test(t)) transaction_type = "credit";

  // amount
  let amount = 0;
  const amtMatch =
    t.match(/(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i) ||
    t.match(/\b([0-9][0-9,]*\.\d{2})\b/);
  if (amtMatch) {
    amount = parseFloat(amtMatch[1].replace(/,/g, "")) || 0;
  }

  // a/c last 4 — prefer COUNTERPARTY account (after "to"/"from"), not user's own.
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

  // reference / UTR
  let transaction_reference: string | null = null;
  const ref =
    t.match(
      /\b(?:utr|rrn|ref(?:erence)?(?:\s*no\.?|#)?|txn(?:\s*id)?|upi(?:\s*ref)?)\s*[:#]?\s*([A-Z0-9]{6,})/i,
    ) || t.match(/\b([0-9]{10,16})\b/);
  if (ref) transaction_reference = ref[1];

  // channel / bank hints
  let bank_name: string | null = null;
  const channelMatch = lower.match(/\b(upi|imps|neft|rtgs|atm|pos|cdm|ach|bbps)\b/);
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
    if (lower.includes(needle)) {
      bank_name = name;
      break;
    }
  }
  if (!bank_name && smsSender) {
    const s = smsSender.toLowerCase();
    for (const [needle, name] of banks) {
      if (s.includes(needle.replace(/\s/g, ""))) {
        bank_name = name;
        break;
      }
    }
  }

  // counterparty name — for debits look after "to", for credits after "from"/"by".
  let sender_name: string | null = null;
  const nameMatch =
    (transaction_type === "debit"
      ? t.match(/\bto\s+([A-Z][A-Za-z][A-Za-z .'&\-]{1,50}?)(?=\s+(?:a\/?c|account|ac|on|via|ref|utr|rrn|imps|neft|upi|\.|,|$))/)
      : t.match(/\b(?:from|by)\s+([A-Z][A-Za-z][A-Za-z .'&\-]{1,50}?)(?=\s+(?:a\/?c|account|ac|on|via|ref|utr|rrn|imps|neft|upi|\.|,|$))/)) ||
    t.match(/\b(?:from|by|to)\s+([A-Z][A-Za-z][A-Za-z .'&\-]{1,50})/) ||
    t.match(/vpa\s+([a-z0-9._\-]+@[a-z]+)/i);
  if (nameMatch) {
    sender_name = nameMatch[1]
      .replace(/\b(on|dated|ref|via|upi|imps|neft|rtgs|a\/?c|account)\b.*$/i, "")
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

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v as string);
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    for (const [k, v] of Object.entries(cors)) res.setHeader(k, v as string);
    return res.end();
  }
  if (req.method !== "POST") {
    return json(res, 405, { success: false, error: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, {
      success: false,
      error: "Server not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  if (!SMS_WEBHOOK_SECRET) {
    return json(res, 500, {
      success: false,
      error: "Server not configured: missing SMS_WEBHOOK_SECRET",
    });
  }

  // Auth
  const headerSecret =
    (req.headers["x-webhook-secret"] as string | undefined) ||
    ((req.headers["authorization"] as string | undefined) || "").replace(/^Bearer\s+/i, "");
  const url = new URL(req.url || "/", "http://x");
  const querySecret = url.searchParams.get("secret") || undefined;
  const provided = headerSecret || querySecret;
  if (!provided || provided !== SMS_WEBHOOK_SECRET) {
    return json(res, 401, { success: false, error: "Unauthorized" });
  }

  // Body (Vercel parses JSON automatically when content-type is set, but be defensive)
  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = { text: body }; }
  }
  if (!body || typeof body !== "object") {
    return json(res, 400, { success: false, error: "Invalid JSON body" });
  }

  const message: string =
    body.text || body.message || body.body || body.sms || body.content || "";
  const smsSender: string | null =
    body.from || body.sender || body.address || body.phone || null;

  if (!message || typeof message !== "string" || message.length < 3) {
    return json(res, 400, {
      success: false,
      error: "Missing SMS text (expected `text`, `message`, or `body` field)",
    });
  }
  if (message.length > 4000) {
    return json(res, 400, { success: false, error: "SMS too long" });
  }

  const parsed = parseSms(message, smsSender);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

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

  if (error) {
    console.error("[/api/sms] insert error", error);
    return json(res, 500, { success: false, error: error.message });
  }

  return json(res, 200, { success: true, id: data?.id, parsed });
}
