
-- Transaction type enum
DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Main table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  transaction_type public.transaction_type NOT NULL,
  sender_name TEXT,
  transaction_reference TEXT,
  bank_name TEXT,
  account_number_last4 TEXT,
  message TEXT,
  sms_sender TEXT,
  raw_sms TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx
  ON public.transactions (transaction_date DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx
  ON public.transactions (transaction_type);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx
  ON public.transactions (created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_set_updated_at ON public.transactions;
CREATE TRIGGER transactions_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grants (Data API requires explicit grants)
GRANT SELECT ON public.transactions TO anon;
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- RLS: public read; writes only via service role (which bypasses RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read transactions" ON public.transactions;
CREATE POLICY "Public can read transactions"
  ON public.transactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Realtime
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN duplicate_object THEN null;
WHEN others THEN null; END $$;
