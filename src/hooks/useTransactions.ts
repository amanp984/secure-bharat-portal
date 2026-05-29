import { useEffect, useState } from "react";
import { useMemo } from "react";
import { accounts, computeCurrentBalance } from "@/lib/banking-data";

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

function buildNarration(row: DbRow): string {
  const channel = (row.bank_name || "").toUpperCase();
  const action = row.transaction_type === "credit" ? "CREDIT" : "DEBIT";
  const who = row.sender_name ? `/${row.sender_name.toUpperCase()}` : "";
  const ref = row.transaction_reference ? ` REF ${row.transaction_reference}` : "";
  const prefix = channel ? `${channel}/` : "";
  return `${prefix}${action}${who}${ref}`.trim();
}

/**
 * Map DB rows (returned newest-first) into UI rows with a correct running
 * balance per row. We compute the closing balance from opening + credits −
 * debits, then walk the desc-ordered list assigning each row its
 * balance-after-this-txn and stripping the txn for the next (older) row.
 */
function mapRows(rows: DbRow[]): UiTransaction[] {
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
    let cleanup: (() => void) | undefined;

    (async () => {
      let supabase: any;
      try {
        const mod = await import("@/integrations/supabase/client");
        supabase = mod.supabase;
      } catch (err) {
        console.warn("[useTransactions] Supabase client unavailable", err);
        if (active) setLoading(false);
        return;
      }

      const load = async () => {
        try {
          // Page through all rows (Supabase caps single requests at 1000).
          const PAGE = 1000;
          let from = 0;
          const all: DbRow[] = [];
          // Hard upper bound to prevent runaway loops.
          for (let i = 0; i < 50; i++) {
            const { data, error } = await supabase
              .from("transactions")
              .select("*")
              .order("transaction_date", { ascending: false })
              .range(from, from + PAGE - 1);
            if (error) {
              console.warn("[useTransactions] load error", error.message ?? error);
              break;
            }
            const rows = (data || []) as DbRow[];
            all.push(...rows);
            if (rows.length < PAGE) break;
            from += PAGE;
          }
          if (!active) return;
          setTransactions(mapRows(all));
        } catch (err) {
          console.warn("[useTransactions] load threw", err);
          if (active) setTransactions([]);
        } finally {
          if (active) setLoading(false);
        }
      };

      await load();

      try {
        // Unique channel name per mount avoids "cannot add postgres_changes
        // callbacks after subscribe()" when React StrictMode (or HMR) re-runs
        // the effect and Supabase returns the already-subscribed channel.
        const channelName = `transactions-realtime-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;
        const channel = supabase.channel(channelName);
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transactions" },
          () => { load().catch(() => {}); },
        );
        channel.subscribe((status: string) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            console.warn("[useTransactions] realtime status", status);
          }
        });
        cleanup = () => {
          try { supabase.removeChannel(channel); } catch { /* ignore */ }
        };
      } catch (err) {
        console.warn("[useTransactions] realtime subscribe failed", err);
      }
    })();

    return () => {
      active = false;
      try { cleanup?.(); } catch { /* ignore */ }
    };
  }, []);

  return { transactions, loading };
}
