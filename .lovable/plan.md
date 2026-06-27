## Goal

Move every customer detail (name, IDs, accounts, credentials, addresses, opening balance) out of the frontend and into the backend, and add a hidden Admin Mode in Settings that edits those values live — no republish required.

## 1. Backend schema (new migration)

**`customer_profile`** — single-row table holding the live customer record:
- holder_name, customer_id, account_number, ifsc, micr
- username, password_hash (bcrypt/argon-style hash, never plaintext)
- email, mobile, address, branch_name, branch_address
- opening_balance (numeric) — drives "Available Balance" together with the live ledger
- updated_at

Seeded with the current values (PRAJAPATI A J / 67324869786 / 6348943378 / IDIB000B199 / etc.) and the current login (`67324869786` / `PRAJA@1999`).

**`admin_audit_log`** — append-only history:
- field, old_value, new_value, changed_at

Both tables: RLS enabled, `anon`/`authenticated` get **no** direct access. All reads/writes go through serverless endpoints using the service role.

## 2. New secret

- `ADMIN_PASSWORD` = `USER1947` (server-side only; never shipped to the browser).

## 3. New serverless endpoints (`api/*.ts`, Vercel functions, service-role)

- `GET  /api/profile` — returns the public profile (no password fields). Cached client-side via TanStack Query with a short stale time so updates appear instantly.
- `POST /api/admin/login` — body `{ password }`; compares to `ADMIN_PASSWORD`; returns a short-lived signed admin token (HMAC with `SMS_WEBHOOK_SECRET` or a new `ADMIN_SESSION_SECRET`).
- `POST /api/admin/profile` — body `{ token, changes }`; verifies token, diffs each field, writes audit rows, updates `customer_profile`. If `username`/`password` change, the new credentials are usable immediately on next login.
- `POST /api/auth/login` — body `{ username, password }`; validates against `customer_profile` (hashed compare). Replaces the hardcoded check in `DemoAuthGate`.

Admin token lives in `sessionStorage` only, cleared on logout — Admin Mode auto-locks per session.

## 4. Frontend refactor

- New `useCustomerProfile()` hook (TanStack Query) — single source of truth, replaces every import of `profile` / `accounts` from `src/lib/banking-data.ts`.
- `banking-data.ts` keeps only static UI lists (billers, faqs, tickets) and a `computeCurrentBalance` helper that now takes `openingBalance` as an argument.
- Every consumer rewritten to read from the hook:
  - Dashboard welcome banner, Current Account card, masked number, balance, IFSC, branch
  - Account Details dialog and `/accounts/$id` pages
  - `ProfilePanel`, `TopNavbar`, Settings
  - Transactions, Passbook, Mini Statement, Transfer, Deposits, Bills, Cards
  - PDF statement generator (`src/lib/pdf-statement.ts`) — accepts profile as a parameter; download buttons pass the freshly fetched profile so every PDF uses live values
- Masked account number computed everywhere as `XXXX XXXX ${accountNumber.slice(-4)}` — never stored, never hardcoded.
- `DemoAuthGate` calls `/api/auth/login` instead of comparing constants; forgot-password flow updates via the admin endpoint path or is left as-is (local override) — to confirm below.

## 5. Settings → Admin Access

New card at the top of `/settings`:
- Title: **Admin Access**
- Subtitle: *Administrator authentication For Banks Executive only.*
- Button: **Enter Admin Mode** → password prompt → calls `/api/admin/login`.
- After unlock, the Settings page reveals an **Edit Customer Details** form with every editable field listed in the request, plus **Available Balance** (edits `opening_balance`).
- Inline validation (account number digits, IFSC pattern, email, mobile, non-empty username/password).
- **Save Changes** posts to `/api/admin/profile`, invalidates the `useCustomerProfile` query → all screens refresh within ~1s with no reload.
- An **Audit Log** section below shows the last 50 changes.
- Admin Mode badge in the navbar while active; **Exit Admin Mode** button; auto-locks on logout / refresh.

## 6. Cleanup

- Remove hardcoded customer strings from: `banking-data.ts` (profile/account constants), `brand.ts` (branch), `DemoAuthGate.tsx` (credentials & reset constants), `routes/index.tsx`, `routes/settings.tsx`, `routes/fund-transfer.tsx`, `components/banking/TopNavbar.tsx`.
- After the refactor, a project-wide grep for the current values (`PRAJAPATI`, `67324869786`, `6348943378`, `IDIB000B199`, `PRAJA@1999`, `Jaipur`) must return zero matches outside the seed migration.

## Open questions before I build

1. **Forgot-password flow** — keep the existing local override (card last-4 + PIN resets the locally stored password) or remove it now that real credentials live in the backend?
2. **Audit log visibility** — show inside the Admin panel only, or also expose a downloadable CSV?
3. **Admin session length** — auto-lock after the existing 3-minute idle timer, or a separate shorter timeout (e.g. 10 min)?

Answer those three and I'll implement end-to-end.
