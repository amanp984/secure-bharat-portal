// Admin-only transaction CRUD client. Talks to the `admin-transactions`
// edge function, which validates the admin password server-side and uses the
// service role. The SMS pipeline is untouched — the same table/rendering
// pipeline is reused so manual and SMS transactions coexist.
import { supabase } from "@/integrations/supabase/client";

export type AdminTxnRow = {
  amount: number;
  transaction_type: "credit" | "debit";
  sender_name: string | null;
  transaction_reference: string | null;
  bank_name: string | null;
  account_number_last4: string | null;
  message: string | null;
  transaction_date: string;
};

const PWD_KEY = "indian_one_admin_pwd";

export function setAdminPassword(pwd: string) {
  try {
    sessionStorage.setItem(PWD_KEY, pwd);
  } catch {}
}

function getAdminPassword(): string {
  try {
    return sessionStorage.getItem(PWD_KEY) || "";
  } catch {
    return "";
  }
}

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-transactions", {
    method: "POST",
    body,
    headers: { "x-admin-password": getAdminPassword() },
  });
  if (error) throw error;
  const err = (data as { error?: string } | null)?.error;
  if (err) throw new Error(err);
  return data;
}

export const adminCreateTransaction = (row: AdminTxnRow) => call({ action: "create", row });
export const adminUpdateTransaction = (id: string, row: AdminTxnRow) =>
  call({ action: "update", id, row });
export const adminDeleteTransaction = (id: string) => call({ action: "delete", id });
