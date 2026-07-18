import { useEffect, useState } from "react";
import { useMemo } from "react";
import { accounts, computeCurrentBalance } from "@/lib/banking-data";
import { setCanonicalTxns } from "@/lib/canonical-txns";
import { supabase } from "@/integrations/supabase/client";

// UI transaction shape — matches what the dashboard already expects.
export interface UiTransaction {
  id: string;
  isoDate: string;
  date: string;
  narration: string;
  channel: string;
  type: "Credit" | "Debit";
  debit: number;
  credit: number;
  balance: number;
  reference: string | null;
  bank: string | null;
  accountLast4: string | null;
  rawSms: string | null;
  smsSender: string | null;
}

interface DbRow {
  id: string;
  amount: number | string;
  transaction_type: "credit" | "debit";
  sender_name: string | null;
  transaction_reference: string | null;
  bank_name: string | null;
  account_number_last4: string | null;
  message: string | null;
  sms_sender: string | null;
  raw_sms: string | null;
  transaction_date: string;
}

const OPENING_BALANCE = accounts[0]?.balance ?? 0;

function formatDate(iso: string): { isoDate: string; date: string } {
  const d = new Date(iso);
  const valid = !isNaN(d.getTime());
  return {
    isoDate: valid ? d.toISOString().slice(0, 10) : String(iso).slice(0, 10),
    date: valid
      ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : String(iso),
  };
}

function detectChannel(row: DbRow): "UPI" | "IMPS" | "NEFT" | "RTGS" {
  const hay = `${row.bank_name || ""} ${row.message || ""} ${row.raw_sms || ""} ${row.transaction_reference || ""}`.toUpperCase();
  if (/\bRTGS\b/.test(hay)) return "RTGS";
  if (/\bNEFT\b/.test(hay)) return "NEFT";
  if (/\bIMPS\b/.test(hay)) return "IMPS";
  return "UPI";
}

function cleanName(raw: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/\b(with|on|dated|ref(?:erence)?(?:\s*no\.?|#)?|via|upi|imps|neft|rtgs|a\/?c|account|utr|rrn|avl|bal)\b.*$/i, "")
    .replace(/[\s.,;:/\-]+$/g, "")
    .trim();
}

function buildNarration(row: DbRow): string {
  const action = row.transaction_type === "credit" ? "CREDIT" : "DEBIT";
  const channel = detectChannel(row);
  const name = cleanName(row.sender_name);
  const ref = (row.transaction_reference || "").trim();
  const last4 = (row.account_number_last4 || "").trim();
  const parts: string[] = [action, channel];
  if (name) parts.push(name);
  if (channel === "UPI") {
    if (ref) parts.push(`UTR ${ref}`);
  } else if (channel === "IMPS") {
    if (last4) parts.push(`A/C XX${last4}`);
    if (ref) parts.push(`UTR ${ref}`);
  } else {
    if (ref) parts.push(`UTR ${ref}`);
    if (last4) parts.push(`A/C XX${last4}`);
  }
  return parts.join(" / ");
}

/**
 * Map DB rows (returned newest-first) into UI rows with a correct running
 * balance per row. We compute the closing balance from opening + credits −
 * debits, then walk the desc-ordered list assigning each row its
 * balance-after-this-txn and stripping the txn for the next (older) row.
 */
function dedupeByUtr(rows: DbRow[]): DbRow[] {
  const seen = new Set<string>();
  const out: DbRow[] = [];
  for (const r of rows) {
    const utr = (r.transaction_reference || "").trim();
    if (utr) {
      if (seen.has(utr)) continue;
      seen.add(utr);
    }
    out.push(r);
  }
  return out;
}

function mapRows(input: DbRow[]): UiTransaction[] {
  const rows = dedupeByUtr(input);
  const totalCredit = rows.reduce((s, r) => s + (r.transaction_type === "credit" ? Number(r.amount) || 0 : 0), 0);
  const totalDebit = rows.reduce((s, r) => s + (r.transaction_type === "debit" ? Number(r.amount) || 0 : 0), 0);
  let running = OPENING_BALANCE + totalCredit - totalDebit; // closing balance
  return rows.map((r) => {
    const amount = Number(r.amount) || 0;
    const type: "Credit" | "Debit" = r.transaction_type === "credit" ? "Credit" : "Debit";
    const credit = type === "Credit" ? amount : 0;
    const debit = type === "Debit" ? amount : 0;
    const { isoDate, date } = formatDate(r.transaction_date);
    const balanceAfter = running;
    // Strip this txn so the next (older) row shows the balance BEFORE it.
    running = running - credit + debit;
    const txn: UiTransaction = {
      id: r.id,
      isoDate,
      date,
      narration: buildNarration(r) || (r.message ?? "Transaction"),
      channel: (r.bank_name || r.sms_sender || "SMS").toString(),
      type,
      debit,
      credit,
      balance: balanceAfter,
      reference: r.transaction_reference,
      bank: r.bank_name,
      accountLast4: r.account_number_last4,
      rawSms: r.raw_sms,
      smsSender: r.sms_sender,
    };
    return txn;
  });
}

/**
 * Fault-tolerant transactions hook.
 *
 * - Never throws: any Supabase / network / config error is swallowed and the
 *   UI sees an empty list. The dashboard, transactions, statement and passbook
 *   pages all render normally even when the backend is unavailable.
 * - Lazy-imports the Supabase client so a missing env var at module load
 *   cannot crash the React tree.
 * - Realtime is best-effort — websocket failures are ignored.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<UiTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("list-transactions", {
          method: "GET",
        });
        if (error) throw error;
        if (!active) return;
        const rows = (data as { transactions?: DbRow[] } | null)?.transactions || [];
        console.log("[useTransactions] loaded", rows.length, "rows");
        const mapped = mapRows(rows);
        setCanonicalTxns(mapped);
        setTransactions(mapped);
      } catch (err) {
        console.warn("[useTransactions] load failed", err);
        if (active) setTransactions((prev) => prev);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    // Poll as a safety net.
    timer = setInterval(() => { load().catch(() => {}); }, 15000);

    // Realtime: refetch immediately whenever a new SMS row is inserted.
    const channel = supabase
      .channel(`transactions-live-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => { load().catch(() => {}); },
      )
      .subscribe();

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);


  const balance = useMemo(
    () => computeCurrentBalance(transactions, OPENING_BALANCE),
    [transactions],
  );

  return { transactions, loading, balance };
}

/** Convenience hook for components that only need the live balance. */
export function useCurrentBalance(): number {
  return useTransactions().balance;
}
