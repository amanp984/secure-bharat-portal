// POST /api/auth/login — validate customer login against backend.
import { createClient } from "@supabase/supabase-js";
import { setCors } from "../_lib/admin.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("customer_profile")
    .select("username, password_hash")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(401).json({ error: "Invalid credentials" });

  const stored = String(data.password_hash || "");
  const storedPwd = stored.startsWith("plain:") ? stored.slice(6) : stored;
  if (data.username !== username || storedPwd !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  return res.status(200).json({ success: true });
}
