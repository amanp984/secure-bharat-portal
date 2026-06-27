
-- Customer profile (single row)
CREATE TABLE public.customer_profile (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_name     text NOT NULL,
  customer_id     text NOT NULL,
  account_number  text NOT NULL,
  username        text NOT NULL,
  password_hash   text NOT NULL,
  ifsc            text NOT NULL,
  micr            text NOT NULL,
  email           text NOT NULL,
  mobile          text NOT NULL,
  address         text NOT NULL,
  branch_name     text NOT NULL,
  branch_address  text NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.customer_profile TO service_role;
ALTER TABLE public.customer_profile ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: this table is service-role only.

CREATE TRIGGER trg_customer_profile_updated_at
  BEFORE UPDATE ON public.customer_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit log
CREATE TABLE public.admin_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field       text NOT NULL,
  old_value   text,
  new_value   text,
  changed_at  timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated.

CREATE INDEX idx_admin_audit_changed_at ON public.admin_audit_log (changed_at DESC);

-- Seed the current live customer record. Password is stored as
-- "plain:<password>" — the API layer reads/compares it directly. The
-- column is named password_hash to leave room for future hashing.
INSERT INTO public.customer_profile (
  holder_name, customer_id, account_number, username, password_hash,
  ifsc, micr, email, mobile, address, branch_name, branch_address, opening_balance
) VALUES (
  'PRAJAPATI A J',
  '67324869786',
  '6348943378',
  '67324869786',
  'plain:PRAJA@1999',
  'IDIB000B199',
  '03755786468',
  'prajap77653@gmail.com',
  '+91 XXXXX88202',
  'Shop No. 12, Govardhan Colony, Near JK Petrol, Jaipur - 76',
  'Jaipur',
  'Indian Bank A/12, Western Highway, Jaipur - 79',
  0
);
