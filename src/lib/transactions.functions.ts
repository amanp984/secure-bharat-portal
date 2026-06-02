import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface DbTxnRow {
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

/**
 * Returns the full transaction ledger for the demo dashboard.
 *
 * The `transactions` table no longer permits anon SELECT — all reads must go
 * through this server function, which uses the service-role client. The data
 * is the single demo account ledger displayed on the dashboard.
 */
export const listTransactions = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbTxnRow[]> => {
    const PAGE = 1000;
    const all: DbTxnRow[] = [];
    for (let i = 0; i < 50; i++) {
      const from = i * PAGE;
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .select(
          "id, amount, transaction_type, sender_name, transaction_reference, bank_name, account_number_last4, message, sms_sender, raw_sms, transaction_date",
        )
        .order("transaction_date", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) {
        console.warn("[listTransactions] load error", error.message);
        break;
      }
      const rows = (data || []) as DbTxnRow[];
      all.push(...rows);
      if (rows.length < PAGE) break;
    }
    return all;
  },
);
