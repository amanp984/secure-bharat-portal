// GET /api/admin/audit — list recent audit log entries (admin-only).
import { createClient } from "@supabase/supabase-js";
import { setCors, verifyAdminToken } from "../_lib/admin.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  if (!verifyAdminToken(auth)) return res.status(401).json({ error: "Invalid or expired admin session" });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, field, old_value, new_value, changed_at")
    .order("changed_at", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ entries: data || [] });
}
