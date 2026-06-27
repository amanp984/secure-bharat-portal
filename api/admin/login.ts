// POST /api/admin/login — verify the admin password and mint an HMAC token.
import { setCors, signAdminToken } from "../_lib/admin.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = String(body?.password ?? "");
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Admin not configured" });
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Invalid admin password" });

  const token = signAdminToken();
  return res.status(200).json({ token, expiresIn: 30 * 60 });
}
