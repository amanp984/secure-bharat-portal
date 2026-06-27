// Admin session token storage — sessionStorage only, cleared on logout/refresh-tab-close.
const KEY = "indian_one_admin_token";

export function getAdminToken(): string | null {
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}
export function setAdminToken(token: string) {
  try { sessionStorage.setItem(KEY, token); } catch {}
}
export function clearAdminToken() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
export function isAdminActive(): boolean {
  return !!getAdminToken();
}
