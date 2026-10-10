-- IEEE Week registration integrity. Safe to run more than once.
-- Run in the Supabase SQL editor.
--
-- 1. One registration per event per team lead is already enforced by the existing key
--    unique (event_id, email). The app stores the lead's phone number as that identity,
--    so a lead can never have two registrations for the same event, even if two
--    requests arrive at the same instant.
--
-- 2. A payment reference (UTR) can be used by only one registration. The app already
--    checks this, this index makes the database refuse it too.

create unique index if not exists event_registrations_transaction_unique
  on public.event_registrations (lower(transaction_id))
  where transaction_id <> '';
