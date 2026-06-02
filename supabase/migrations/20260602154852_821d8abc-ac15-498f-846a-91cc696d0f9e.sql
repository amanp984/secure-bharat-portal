DROP POLICY IF EXISTS "Public can read transactions" ON public.transactions;
REVOKE SELECT ON public.transactions FROM anon;
REVOKE SELECT ON public.transactions FROM authenticated;