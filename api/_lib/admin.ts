// Shared helpers for admin endpoints.
import crypto from "node:crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function signAdminToken(): string {
  const exp = Date.now() + TTL_MS;
  const payload = `admin.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || !SECRET) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `admin.${expStr}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function setCors(res: any) {
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
}

export const EDITABLE_FIELDS = [
  "holder_name",
  "customer_id",
  "account_number",
  "username",
  "password",
  "ifsc",
  "micr",
  "email",
  "mobile",
  "address",
  "branch_name",
  "branch_address",
  "opening_balance",
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];
