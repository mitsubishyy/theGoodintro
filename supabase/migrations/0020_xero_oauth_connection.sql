-- ─────────────────────────────────────────────────────────────────────────
-- 0020 — Xero OAuth connection store (DEC-13; XERO_INTEGRATION_CONTRACT.md §2).
--
-- Stage 1 of the Xero payments integration: the OAuth "Connect Xero" flow.
-- Stores the single org connection plus its tokens. Tokens are encrypted at
-- the application layer (AES-256-GCM, lib/crypto.ts) BEFORE they reach this
-- table, so the columns hold ciphertext only — the DB never sees a usable
-- access/refresh token. The row is written exclusively by the signature/
-- session-checked callback via the service-role client; RLS is enabled with
-- NO policies so anon/auth roles cannot read it at all (defence in depth on
-- top of the encryption).
--
-- Refresh tokens rotate on every use (contract §2): the callback and the
-- future refresh path UPSERT this row, replacing both tokens together.
--
-- Gated by the integrations_xero feature flag, OFF by default
-- (CHANGE_SAFETY.md): with it off the Connect action is inert and nothing
-- calls Xero. Reversible: see ../down/0020_xero_oauth_connection_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create table public.xero_connection (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          text not null unique,          -- Xero organisation (tenantId)
  tenant_name        text,                           -- display name, e.g. "Demo Company (AU)"
  access_token_enc   text not null,                  -- AES-256-GCM ciphertext (base64)
  refresh_token_enc  text not null,                  -- AES-256-GCM ciphertext (base64)
  expires_at         timestamptz not null,           -- access-token expiry (now + ~30 min)
  scope              text,                           -- granted scopes, space-separated
  connected_by       uuid references public.staff(id),
  connected_at       timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.xero_connection is
  'Single Xero org OAuth connection. Tokens are app-layer encrypted (lib/crypto.ts); service-role only (RLS on, no policies). DEC-13.';

create trigger t_xero_connection_updated
  before update on public.xero_connection
  for each row execute function public.set_updated_at();

-- Service-role only: enable RLS and grant no policies (the callback writes with
-- the service-role client, which bypasses RLS; no other role may read tokens).
alter table public.xero_connection enable row level security;

insert into public.feature_flag (key, enabled, description) values
  ('integrations_xero', false,
   'Xero payments integration (DEC-13). Off = Connect action inert, no calls to Xero.')
on conflict (key) do nothing;
