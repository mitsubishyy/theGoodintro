-- ─────────────────────────────────────────────────────────────────────────
-- STAGING-ONLY synthetic seed. NEVER run against production.
--
-- Creates three login users (one admin, two vendor owners on different work
-- domains) plus a small realistic data set so the admin shell has something to
-- show and the tenant boundary (RLS) can be tested end to end. Password for all
-- synthetic users: Passw0rd!test
--
-- Applied to staging via the Supabase MCP execute_sql (not a migration).
-- All UUIDs are fixed/deterministic for idempotent re-runs.
-- ─────────────────────────────────────────────────────────────────────────

-- Auth users (password login). pgcrypto lives in the `extensions` schema.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
   is_sso_user, is_anonymous, confirmation_token, recovery_token,
   email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000a001',
   'authenticated','authenticated','admin@thegoodintro.test',
   extensions.crypt('Passw0rd!test', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}','{"name":"Issy (synthetic)"}',
   false,false,'','','',''),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000a002',
   'authenticated','authenticated','alex@alpha.test',
   extensions.crypt('Passw0rd!test', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}','{"name":"Alex Alpha"}',
   false,false,'','','',''),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000a003',
   'authenticated','authenticated','blair@beta.test',
   extensions.crypt('Passw0rd!test', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}','{"name":"Blair Beta"}',
   false,false,'','','','')
on conflict (id) do nothing;

insert into auth.identities
  (user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000a001',
   '{"sub":"00000000-0000-0000-0000-00000000a001","email":"admin@thegoodintro.test","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-00000000a002',
   '{"sub":"00000000-0000-0000-0000-00000000a002","email":"alex@alpha.test","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-00000000a003','00000000-0000-0000-0000-00000000a003',
   '{"sub":"00000000-0000-0000-0000-00000000a003","email":"blair@beta.test","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now())
on conflict do nothing;

-- Staff (admin) linked to the admin auth user.
insert into public.staff (id, auth_user_id, name, email, role) values
  ('00000000-0000-0000-0000-0000000005a1','00000000-0000-0000-0000-00000000a001',
   'Issy (synthetic)','admin@thegoodintro.test','super_admin')
on conflict (id) do nothing;

-- Charities.
insert into public.charity (id, name, abn, dgr_status) values
  ('00000000-0000-0000-0000-00000000c1a1','Beyond Blue','28093865327','endorsed'),
  ('00000000-0000-0000-0000-00000000c1a2','OzHarvest','58084504386','endorsed')
on conflict (id) do nothing;

-- EA + executives (active so paid vendors can see them).
insert into public.ea (id, name, email) values
  ('00000000-0000-0000-0000-0000000000ea','Sam EA','sam.ea@execs.test')
on conflict (id) do nothing;

insert into public.executive
  (id, name, title, company, context_notes, default_charity_id, ea_id, status, primary_email)
values
  ('00000000-0000-0000-0000-00000000ec01','Jordan Smith','CFO','Hexagon Bank',
   'Focused on payments modernisation and treasury.',
   '00000000-0000-0000-0000-00000000c1a1','00000000-0000-0000-0000-0000000000ea',
   'active','jordan.smith@hexagon.test'),
  ('00000000-0000-0000-0000-00000000ec02','Riley Chen','COO','Latitude',
   'Scaling ops; interested in workforce tooling.',
   '00000000-0000-0000-0000-00000000c1a2', null,
   'active','riley.chen@latitude.test')
on conflict (id) do nothing;

insert into public.ea_assignment (ea_id, executive_id) values
  ('00000000-0000-0000-0000-0000000000ea','00000000-0000-0000-0000-00000000ec01')
on conflict do nothing;

-- Two vendor orgs on different work domains.
insert into public.vendor (id, name, email_domain, status, cycle_started_at, access_expires_at) values
  ('00000000-0000-0000-0000-00000000ad01','Alpha Pty Ltd','alpha.test','active',
   now(), now() + interval '12 months'),
  ('00000000-0000-0000-0000-00000000bd01','Beta Pty Ltd','beta.test','active',
   now(), now() + interval '12 months')
on conflict (id) do nothing;

insert into public.vendor_user (id, vendor_id, auth_user_id, email, name, role, status) values
  ('00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a002','alex@alpha.test','Alex Alpha','owner','active'),
  ('00000000-0000-0000-0000-00000000b5b1','00000000-0000-0000-0000-00000000bd01',
   '00000000-0000-0000-0000-00000000a003','blair@beta.test','Blair Beta','owner','active')
on conflict (id) do nothing;

update public.vendor set owner_user_id = '00000000-0000-0000-0000-00000000a5a1'
  where id = '00000000-0000-0000-0000-00000000ad01';
update public.vendor set owner_user_id = '00000000-0000-0000-0000-00000000b5b1'
  where id = '00000000-0000-0000-0000-00000000bd01';

-- Alpha has paid for 5 credits, one cycle, one held meeting + its gift record.
insert into public.invoice (id, vendor_id, xero_invoice_id, kind, line_items, amount_cents, status) values
  ('00000000-0000-0000-0000-0000000019a1','00000000-0000-0000-0000-00000000ad01',
   'XERO-TEST-0001','credit_purchase',
   '[{"name":"Meeting credits x5","amount_cents":750000},{"name":"Admin fee","amount_cents":0}]',
   750000,'paid')
on conflict (id) do nothing;

insert into public.cycle (id, vendor_id, started_at, ends_at, held_meetings_count) values
  ('00000000-0000-0000-0000-00000000c9a1','00000000-0000-0000-0000-00000000ad01',
   now(), now() + interval '12 months', 1)
on conflict (id) do nothing;

insert into public.credit_lot (id, vendor_id, quantity, quantity_remaining, invoice_id) values
  ('00000000-0000-0000-0000-0000000010a1','00000000-0000-0000-0000-00000000ad01',
   5, 4, '00000000-0000-0000-0000-0000000019a1')
on conflict (id) do nothing;

insert into public.request
  (id, vendor_id, requested_by_user_id, executive_id, q1_what, q2_why, meeting_minutes, status)
values
  ('00000000-0000-0000-0000-0000000004a1','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Introduce our treasury automation platform.',
   'You have spoken about payments modernisation; we cut reconciliation time by half.',
   45,'accepted')
on conflict (id) do nothing;

insert into public.meeting
  (id, request_id, charity_id, scheduled_at, credit_lot_id, status, outcome_source)
values
  ('00000000-0000-0000-0000-0000000013a1','00000000-0000-0000-0000-0000000004a1',
   '00000000-0000-0000-0000-00000000c1a1', now() - interval '2 days',
   '00000000-0000-0000-0000-0000000010a1','held','zoom_teams_api')
on conflict (id) do nothing;

-- Gift for the held meeting: 1st in the cycle => band 1, $900 charity / $600 admin.
insert into public.gift_record
  (id, meeting_id, charity_id, band_at_completion, charity_amount_cents, admin_fee_cents, status)
values
  ('00000000-0000-0000-0000-00000000610a','00000000-0000-0000-0000-0000000013a1',
   '00000000-0000-0000-0000-00000000c1a1','band_1', 90000, 60000, 'released')
on conflict (id) do nothing;

-- Pillar 3a sign-up test users (no vendor org yet): one work domain, one generic.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
   is_sso_user, is_anonymous, confirmation_token, recovery_token,
   email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000a004',
   'authenticated','authenticated','gina@gamma.test',
   extensions.crypt('Passw0rd!test', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}','{"name":"Gina Gamma"}',
   false,false,'','','',''),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000a005',
   'authenticated','authenticated','freebie@gmail.com',
   extensions.crypt('Passw0rd!test', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}','{"name":"Free Bee"}',
   false,false,'','','','')
on conflict (id) do nothing;

insert into auth.identities
  (user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-00000000a004','00000000-0000-0000-0000-00000000a004',
   '{"sub":"00000000-0000-0000-0000-00000000a004","email":"gina@gamma.test","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now()),
  ('00000000-0000-0000-0000-00000000a005','00000000-0000-0000-0000-00000000a005',
   '{"sub":"00000000-0000-0000-0000-00000000a005","email":"freebie@gmail.com","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now())
on conflict do nothing;
