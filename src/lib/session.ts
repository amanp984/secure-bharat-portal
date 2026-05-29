// Tracks real login/logout timestamps in localStorage so the dashboard can
// display the user's actual previous login instead of a hard-coded value.
const LAST_LOGIN_KEY = "indian_bank_one_last_login";
const CURRENT_LOGIN_KEY = "indian_bank_one_current_login";

function fmt(d: Date): string {
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${date}, ${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

/** Call on successful login. Rolls the previous "current" into "last". */
export function recordLogin() {
  if (typeof window === "undefined") return;
  try {
    const prev = localStorage.getItem(CURRENT_LOGIN_KEY);
    if (prev) localStorage.setItem(LAST_LOGIN_KEY, prev);
    localStorage.setItem(CURRENT_LOGIN_KEY, fmt(new Date()));
  } catch { /* ignore */ }
}

/** Call on logout. */
export function recordLogout() {
  if (typeof window === "undefined") return;
  try {
    const cur = localStorage.getItem(CURRENT_LOGIN_KEY);
    if (cur) localStorage.setItem(LAST_LOGIN_KEY, cur);
    localStorage.removeItem(CURRENT_LOGIN_KEY);
  } catch { /* ignore */ }
}

/** Returns the previous login timestamp, or "First login" if none yet. */
export function getLastLogin(): string {
  if (typeof window === "undefined") return "First login";
  try {
    return localStorage.getItem(LAST_LOGIN_KEY)
      || localStorage.getItem(CURRENT_LOGIN_KEY)
      || "First login";
  } catch {
    return "First login";
  }
}
