// POST /api/admin/profile — update customer profile (admin-only) and write
// per-field audit entries. Returns the updated profile.
import { createClient } from "@supabase/supabase-js";
import { EDITABLE_FIELDS, setCors, verifyAdminToken, type EditableField } from "../_lib/admin.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VALIDATORS: Partial<Record<EditableField, (v: string) => string | null>> = {
  account_number: (v) => (/^\d{6,20}$/.test(v) ? null : "Account number must be 6–20 digits"),
  customer_id: (v) => (/^\d{4,20}$/.test(v) ? null : "Customer ID must be 4–20 digits"),
  ifsc: (v) => (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? null : "IFSC must look like ABCD0XXXXXX"),
  micr: (v) => (/^\d{5,15}$/.test(v) ? null : "MICR must be 5–15 digits"),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email"),
  username: (v) => (v.length >= 4 ? null : "Username must be at least 4 characters"),
  password: (v) => (v.length >= 6 ? null : "Password must be at least 6 characters"),
  holder_name: (v) => (v.trim().length >= 2 ? null : "Holder name is required"),
  branch_name: (v) => (v.trim().length >= 2 ? null : "Branch name is required"),
};

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  if (!verifyAdminToken(auth)) return res.status(401).json({ error: "Invalid or expired admin session" });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const changes: Record<string, string | number> = body?.changes || {};

  // Validate and normalize
  const cleaned: Record<string, string | number> = {};
  for (const k of Object.keys(changes)) {
    if (!(EDITABLE_FIELDS as readonly string[]).includes(k)) continue;
    const raw = changes[k];
    if (raw === null || raw === undefined || raw === "") continue;
    if (k === "opening_balance") {
      const n = Number(raw);
      if (!Number.isFinite(n)) return res.status(400).json({ error: "Opening balance must be a number" });
      cleaned[k] = n;
      continue;
    }
    const str = String(raw).trim();
    const validator = VALIDATORS[k as EditableField];
    if (validator) {
      const msg = validator(str);
      if (msg) return res.status(400).json({ error: `${k}: ${msg}` });
    }
    cleaned[k] = str;
  }

  if (Object.keys(cleaned).length === 0) {
    return res.status(400).json({ error: "No valid changes provided" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch the current row to diff
  const { data: current, error: readErr } = await supabase
    .from("customer_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readErr) return res.status(500).json({ error: readErr.message });
  if (!current) return res.status(404).json({ error: "Profile not found" });

  // Map cleaned input to DB columns ("password" -> "password_hash")
  const dbPatch: Record<string, any> = {};
  const auditRows: { field: string; old_value: string | null; new_value: string | null }[] = [];

  for (const [field, value] of Object.entries(cleaned)) {
    if (field === "password") {
      const oldStored = String(current.password_hash || "");
      const oldPwd = oldStored.startsWith("plain:") ? oldStored.slice(6) : oldStored;
      if (String(value) === oldPwd) continue;
      dbPatch.password_hash = `plain:${value}`;
      auditRows.push({ field: "password", old_value: "••••", new_value: "••••" });
      continue;
    }
    if (String((current as any)[field] ?? "") === String(value)) continue;
    dbPatch[field] = value;
    auditRows.push({
      field,
      old_value: (current as any)[field] == null ? null : String((current as any)[field]),
      new_value: String(value),
    });
  }

  if (Object.keys(dbPatch).length === 0) {
    return res.status(200).json({ profile: stripSecrets(current), audited: 0 });
  }

  const { data: updated, error: upErr } = await supabase
    .from("customer_profile")
    .update(dbPatch)
    .eq("id", current.id)
    .select("*")
    .single();
  if (upErr) return res.status(500).json({ error: upErr.message });

  if (auditRows.length) {
    await supabase.from("admin_audit_log").insert(auditRows);
  }

  return res.status(200).json({ profile: stripSecrets(updated), audited: auditRows.length });
}

function stripSecrets(row: any) {
  if (!row) return row;
  const { password_hash, ...rest } = row;
  return rest;
}
