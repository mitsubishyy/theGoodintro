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
insert into public.invoice
  (id, vendor_id, xero_invoice_id, kind, line_items, amount_cents, status,
   quantity, fee_ex_gst_cents, gst_cents, purchase_date) values
  ('00000000-0000-0000-0000-0000000019a1','00000000-0000-0000-0000-00000000ad01',
   'XERO-TEST-0001','credit_purchase',
   '[{"name":"Meeting credits x5","amount_cents":750000},{"name":"Admin fee","amount_cents":0}]',
   750000,'paid',
   5, 750000, 75000, now()::date)  -- 5 x $1,500 ex-GST; GST = 5 x $150 (PurchaseRow)
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
  (id, meeting_id, charity_id, band_at_completion, charity_amount_cents, admin_fee_cents, status,
   sat_date, cycle_number, position_n, schedule_version)
values
  ('00000000-0000-0000-0000-00000000610a','00000000-0000-0000-0000-0000000013a1',
   '00000000-0000-0000-0000-00000000c1a1','band_1', 90000, 60000, 'released',
   (now() - interval '2 days')::date, 1, 3, 'v1')  -- 3rd held in Alpha's cycle 1
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

-- ─────────────────────────────────────────────────────────────────────────
-- Exec dashboard demo enrichment (0009). Synthetic, staging-only. Populates the
-- executive dashboard's widgets for Jordan Smith (ec01): a richer DGR-charity
-- picker, incoming (submitted) requests, and several held meetings + gifts
-- across two vendors. Money matches CALCULATIONS.md (band 1 = $900 / $600).
-- ─────────────────────────────────────────────────────────────────────────

-- More DGR-endorsed charities (real AU orgs / real ABNs) so the picker + search
-- have substance.
insert into public.charity (id, name, abn, dgr_status) values
  ('00000000-0000-0000-0000-00000000c1a3','Royal Flying Doctor Service','74438059643','endorsed'),
  ('00000000-0000-0000-0000-00000000c1a4','The Smith Family','28000030179','endorsed'),
  ('00000000-0000-0000-0000-00000000c1a5','Black Dog Institute','12115954197','endorsed'),
  ('00000000-0000-0000-0000-00000000c1a6','Cancer Council Australia','91130793725','endorsed')
on conflict (id) do nothing;

-- Two incoming (submitted) requests to Jordan Smith — the "Incoming" column.
insert into public.request
  (id, vendor_id, requested_by_user_id, executive_id, q1_what, q2_why, meeting_minutes, status)
values
  ('00000000-0000-0000-0000-000000005201','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Budget pacing tools for finance leaders moving from product to platform.',
   'Your payments modernisation work is the exact phase where pacing tends to break; two of your peers suggested it would be worth 45 minutes.',
   45,'submitted'),
  ('00000000-0000-0000-0000-000000005203','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Design operations for finance and legal teams at scale.',
   'The brand-and-ops lessons from our IPO prep map closely to what your team is navigating now.',
   45,'submitted')
on conflict (id) do nothing;

-- Alpha: two more accepted requests -> held meetings -> gifts (band 1), plus one
-- confirmed upcoming meeting. Alpha already had 1 held; cycle becomes 3 held.
insert into public.request
  (id, vendor_id, requested_by_user_id, executive_id, q1_what, q2_why, meeting_minutes, status)
values
  ('00000000-0000-0000-0000-0000000004a2','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Treasury reporting automation walkthrough.',
   'Following our last conversation on reconciliation time.',45,'accepted'),
  ('00000000-0000-0000-0000-0000000004a3','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Cash-flow forecasting for treasury teams.',
   'You mentioned weekly pacing was a goal.',45,'accepted'),
  ('00000000-0000-0000-0000-0000000004a4','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec01',
   'Quarterly close acceleration.',
   'A short follow-up to the treasury automation thread.',45,'accepted')
on conflict (id) do nothing;

insert into public.meeting
  (id, request_id, charity_id, scheduled_at, credit_lot_id, status, outcome_source)
values
  ('00000000-0000-0000-0000-0000000013a2','00000000-0000-0000-0000-0000000004a2',
   '00000000-0000-0000-0000-00000000c1a2', now() - interval '21 days',
   '00000000-0000-0000-0000-0000000010a1','held','zoom_teams_api'),
  ('00000000-0000-0000-0000-0000000013a3','00000000-0000-0000-0000-0000000004a3',
   '00000000-0000-0000-0000-00000000c1a1', now() - interval '42 days',
   '00000000-0000-0000-0000-0000000010a1','held','vendor_reported'),
  ('00000000-0000-0000-0000-0000000013a4','00000000-0000-0000-0000-0000000004a4',
   '00000000-0000-0000-0000-00000000c1a1', now() + interval '5 days',
   '00000000-0000-0000-0000-0000000010a1','confirmed', null)
on conflict (id) do nothing;

insert into public.gift_record
  (id, meeting_id, charity_id, band_at_completion, charity_amount_cents, admin_fee_cents, status, created_at,
   sat_date, cycle_number, position_n, paid_date, schedule_version)
values
  ('00000000-0000-0000-0000-0000000061a2','00000000-0000-0000-0000-0000000013a2',
   '00000000-0000-0000-0000-00000000c1a2','band_1', 90000, 60000, 'paid', now() - interval '21 days',
   (now() - interval '21 days')::date, 1, 2, (now() - interval '20 days')::date, 'v1'),  -- 2nd held, paid
  ('00000000-0000-0000-0000-0000000061a3','00000000-0000-0000-0000-0000000013a3',
   '00000000-0000-0000-0000-00000000c1a1','band_1', 90000, 60000, 'released', now() - interval '42 days',
   (now() - interval '42 days')::date, 1, 1, null, 'v1')  -- 1st held in Alpha's cycle 1
on conflict (id) do nothing;

-- Alpha cycle now reflects 3 held; credit lot: 5 bought, 3 held + 1 confirmed reserved => 1 left.
update public.cycle set held_meetings_count = 3
  where id = '00000000-0000-0000-0000-00000000c9a1';
update public.credit_lot set quantity_remaining = 1
  where id = '00000000-0000-0000-0000-0000000010a1';

-- NOTE: Beta (bd01) is deliberately left pristine — no requests, credits, or
-- gifts. The money-path + RLS tests use Beta as the "fresh / no-credit" vendor
-- (tests/meetings.test.ts, tests/rls.test.ts), so demo data must not touch it.
-- The exec's second vendor in the impact list would come from a future seed that
-- also provisions a third vendor; for now all enrichment stays under Alpha.

-- ─────────────────────────────────────────────────────────────────────────
-- Vendor portal demo enrichment (vendor_shell port, 2026-06-12). Synthetic,
-- staging-only. Fills the executive DIRECTORY for the locked Vendor
-- Executives List (industry / country / bio variety, ten rows) and gives
-- Alpha request-level life for the status pills.
--
-- HARD CONSTRAINT: the reporting tests pin the money invariants to the seed
-- above (total gifts $2,700 · meetings sat 3 · GST $750 · cash $7,500 ·
-- deferred $3,000 · Alpha credits remaining 1). This block therefore adds NO
-- held meetings, NO gift records, NO invoices, and NO credit or cycle
-- changes, and still leaves Beta pristine. Directory life only.
--
-- photo_url stays NULL by design (Issy 2026-06-12): the amber monogram
-- fallback is the locked production empty-state; photos arrive when real
-- executives are onboarded. Names/companies follow the locked sample
-- register from the Vendor screens (UI_KIT_DESIGN_LOG).
-- ─────────────────────────────────────────────────────────────────────────

-- Directory columns for the two original execs (0016 backfill).
update public.executive set
  industry = 'Banking',
  bio = 'CFO of a mid-tier Australian bank. Focused on payments modernisation, treasury, and the finance data platform that supports both.'
  where id = '00000000-0000-0000-0000-00000000ec01' and bio is null;
update public.executive set
  industry = 'Financial Services',
  bio = 'COO of a consumer finance business. Scaling operations and workforce tooling across lending and collections.'
  where id = '00000000-0000-0000-0000-00000000ec02' and bio is null;

-- Final two charities of the locked 8-charity picker set (real AU ABNs).
insert into public.charity (id, name, abn, dgr_status) values
  ('00000000-0000-0000-0000-00000000c1a7','Australian Red Cross','50169561394','endorsed'),
  ('00000000-0000-0000-0000-00000000c1a8','Australian Conservation Foundation','22007498482','endorsed')
on conflict (id) do nothing;

-- Eight more active executives (locked sample register; all country AU via
-- the 0016 default; photo_url deliberately NULL).
insert into public.executive
  (id, name, title, company, industry, bio, default_charity_id, status, primary_email)
values
  ('00000000-0000-0000-0000-00000000ec03','Priya Raghavan','CFO','Lumen Industries',
   'Financial Services',
   'CFO of an ASX-listed financial services group. Leads a 120-person finance function through a multi-year operating-model rebuild, with a personal focus on treasury automation and capital discipline.',
   '00000000-0000-0000-0000-00000000c1a3','active','priya.raghavan@lumen.test'),
  ('00000000-0000-0000-0000-00000000ec04','Daniel Akers','COO','BigFour Bank',
   'Banking',
   'Chief Operating Officer at one of Australia''s big four banks. Owns operations across retail and business banking, and is rebuilding branch and contact-centre workflows around digital service.',
   '00000000-0000-0000-0000-00000000c1a1','active','daniel.akers@bigfour.test'),
  ('00000000-0000-0000-0000-00000000ec05','Helena Cho','CMO','Brightline',
   'Telco',
   'CMO of a national telco challenger. Runs brand, growth, and customer-base marketing, and is rebuilding the martech stack after a decade of acquisitions.',
   '00000000-0000-0000-0000-00000000c1a2','active','helena.cho@brightline.test'),
  ('00000000-0000-0000-0000-00000000ec06','Marcus Vance','MD','Helix Capital',
   'Investment Management',
   'Managing Director of a mid-market investment manager. Spends most of his time on portfolio operating performance and capital allocation.',
   '00000000-0000-0000-0000-00000000c1a4','active','marcus.vance@helix.test'),
  ('00000000-0000-0000-0000-00000000ec07','Sarah Liu','CTO','Vector',
   'Logistics SaaS',
   'CTO of a logistics software scale-up serving 3PL operators across APAC. Leads platform engineering and data, with a current focus on warehouse automation integrations.',
   '00000000-0000-0000-0000-00000000c1a5','active','sarah.liu@vector.test'),
  ('00000000-0000-0000-0000-00000000ec08','James Whitfield','CEO','Ironbark Energy',
   'Energy & Resources',
   'Chief Executive of an east-coast energy producer. Interested in grid-scale storage, industrial decarbonisation, and operational technology.',
   '00000000-0000-0000-0000-00000000c1a8','active','james.whitfield@ironbark.test'),
  ('00000000-0000-0000-0000-00000000ec09','Mei Tanaka','CHRO','Sentinel Group',
   'Insurance',
   'Chief People Officer of a national insurer. Leads workforce strategy across 6,000 employees, with current priorities in claims capability and hybrid operating rhythm.',
   '00000000-0000-0000-0000-00000000c1a6','active','mei.tanaka@sentinel.test'),
  ('00000000-0000-0000-0000-00000000ec0a','Rohan Mehta','CRO','Bluewater Logistics',
   'Logistics',
   'Chief Revenue Officer of a freight and logistics group. Owns enterprise sales and customer success nationally, and is consolidating a fragmented commercial tech stack.',
   '00000000-0000-0000-0000-00000000c1a7','active','rohan.mehta@bluewater.test')
on conflict (id) do nothing;

-- Request-level life for Alpha (status pills + Pending widget ages). Money
-- untouched: submitted/declined requests and a proposed meeting with no
-- credit lot reserve nothing and sit outside every pinned total.
insert into public.request
  (id, vendor_id, requested_by_user_id, executive_id, q1_what, q2_why,
   meeting_minutes, status, decline_reason, created_at)
values
  ('00000000-0000-0000-0000-000000005301','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec03',
   'Treasury automation for multi-entity finance teams.',
   'Your operating-model rebuild is the exact phase where reconciliation effort peaks; we have taken three ASX groups through it.',
   45,'submitted', null, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000005302','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec07',
   'Warehouse automation integrations for 3PL platforms.',
   'Vector''s integration roadmap overlaps with the systems we already connect.',
   45,'submitted', null, now() - interval '11 days'),
  ('00000000-0000-0000-0000-000000005303','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec05',
   'Martech consolidation after acquisition.',
   'We helped two telcos retire nine overlapping tools without losing campaign history.',
   45,'accepted', null, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000005304','00000000-0000-0000-0000-00000000ad01',
   '00000000-0000-0000-0000-00000000a5a1','00000000-0000-0000-0000-00000000ec06',
   'Portfolio reporting automation.',
   'Quarterly reporting cycles compress badly at your portfolio size.',
   45,'declined','Not a fit for this half; happy to revisit next FY.', now() - interval '6 days')
on conflict (id) do nothing;

-- Helena accepted; the meeting is proposed, time not yet secured, and NO
-- credit lot is attached (reserve happens at confirm), so credit maths and
-- meetingsSat stay exactly as the tests pin them.
insert into public.meeting (id, request_id, charity_id, status) values
  ('00000000-0000-0000-0000-0000000014a1','00000000-0000-0000-0000-000000005303',
   '00000000-0000-0000-0000-00000000c1a2','proposed')
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════════════
-- EXEC PORTAL SCHEMA (migration 0019) — enrichment for the new fields so the
-- locked exec screens + the schema tests have data. Updates by known seed IDs
-- (the base inserts above use fixed column lists + on-conflict-do-nothing, so
-- the new columns are populated here). Nomination history is created by 0019's
-- backfill (one open row per exec with a standing charity); the locked Priya
-- two-row Beyond Blue -> RFDS sample is left for the My charity port.
-- ════════════════════════════════════════════════════════════════════════════

-- Charity short names (the short-mark / "sent to the Flying Doctor" reference).
update public.charity set short_name = 'Beyond Blue'    where id = '00000000-0000-0000-0000-00000000c1a1';
update public.charity set short_name = 'OzHarvest'      where id = '00000000-0000-0000-0000-00000000c1a2';
update public.charity set short_name = 'Flying Doctor'  where id = '00000000-0000-0000-0000-00000000c1a3';
update public.charity set short_name = 'Smith Family'   where id = '00000000-0000-0000-0000-00000000c1a4';
update public.charity set short_name = 'Black Dog'      where id = '00000000-0000-0000-0000-00000000c1a5';
update public.charity set short_name = 'Cancer Council' where id = '00000000-0000-0000-0000-00000000c1a6';
update public.charity set short_name = 'Red Cross'      where id = '00000000-0000-0000-0000-00000000c1a7';
update public.charity set short_name = 'ACF'            where id = '00000000-0000-0000-0000-00000000c1a8';

-- ════════════════════════════════════════════════════════════════════════════
-- Charity content (migration 0021). v1 = curated by hand, no scraper. cause +
-- dgr_item on all 8 (Direction Card / picker rows / My charity hero credentials);
-- the dgr_item values are illustrative demo data. Full DETAIL-modal content
-- (purpose / programmes / quote / stories) is curated for Priya's standing
-- charity RFDS; the other 7 carry the short fields and degrade the modal's
-- richer sections honestly until curated. logo_url / hero_image_url stay NULL so
-- the initials + tint fallbacks render.
update public.charity set cause = 'Mental health and wellbeing · Australia-wide',           dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a1';
update public.charity set cause = 'Food rescue and hunger relief · Australia-wide',          dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a2';
update public.charity set cause = 'Remote health services · Australia-wide',                 dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a3';
update public.charity set cause = 'Education for children in need · Australia-wide',          dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a4';
update public.charity set cause = 'Mental health research and prevention · Australia-wide',   dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a5';
update public.charity set cause = 'Cancer research, prevention and support · Australia-wide', dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a6';
update public.charity set cause = 'Humanitarian aid and resilience · Australia-wide',         dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a7';
update public.charity set cause = 'Environment and climate · Australia-wide',                 dgr_item = 'Item 1 DGR' where id = '00000000-0000-0000-0000-00000000c1a8';

update public.charity set
  purpose = 'The Royal Flying Doctor Service provides emergency aeromedical care and primary health services to people who live, work and travel across remote and rural Australia, so that anyone, anywhere, can reach the care they need.',
  programmes = '[
    {"label":"Emergency aeromedical retrieval","body":"Round-the-clock aircraft and medical crews reach critically ill and injured people in places no road or ambulance can, then fly them to definitive care."},
    {"label":"Primary and mental health clinics","body":"Regular fly-in clinics bring GPs, nurses, dentists and mental health clinicians to remote communities that would otherwise go without."},
    {"label":"Indigenous health programmes","body":"Community-led work with First Nations communities focuses on chronic disease, maternal health and the long-term wellbeing of country."}
  ]'::jsonb,
  featured_quote = 'Without the Flying Doctor, we''d have lost him. Simple as that.',
  featured_quote_attribution = 'Station owner, Diamantina Shire QLD',
  stories = '[
    {"published_at":"2026-05-12","headline":"A nine-hour night flight from Birdsville","body":"A late-night retrieval from one of the most remote corners of Queensland, and the crew who made the call to fly.","url":"https://www.flyingdoctor.org.au/news/"},
    {"published_at":"2026-04-28","headline":"First mental health clinic lands in Wilcannia","body":"A new fly-in mental health service begins regular clinics in far-west New South Wales.","url":"https://www.flyingdoctor.org.au/news/"}
  ]'::jsonb,
  content_updated_at = now()
where id = '00000000-0000-0000-0000-00000000c1a3';

-- Priya's locked two-row nomination history (Beyond Blue 9 Feb 2024 to 12 May
-- 2024, then RFDS 12 May 2024 to present). Seeded before the generic backfill
-- below so its not-exists guard skips her.
insert into public.nomination_history (executive_id, charity_id, started_at, ended_at) values
  ('00000000-0000-0000-0000-00000000ec03','00000000-0000-0000-0000-00000000c1a1','2024-02-09T00:00:00+10:00','2024-05-12T00:00:00+10:00'),
  ('00000000-0000-0000-0000-00000000ec03','00000000-0000-0000-0000-00000000c1a3','2024-05-12T00:00:00+10:00', null)
on conflict do nothing;

-- Priya Raghavan (ec03) is the locked exec-portal sample: full business context,
-- LinkedIn, timezone, a connected calendar, and a preferred meeting window.
update public.executive set
  linkedin_url      = 'https://www.linkedin.com/in/priya-raghavan',
  interested_in     = 'Treasury automation, finance operating-model design, and capital discipline at ASX scale.',
  current_projects  = 'A multi-year finance transformation: consolidating four ERPs and standing up a real-time reconciliation layer.',
  not_interested_in = 'Generic outsourcing pitches, contingent recruiting, and anything that starts with a demo.',
  timeline          = 'Actively reviewing this half',
  seniority_signal  = 'C-suite, ASX-listed',
  suggested_cadence = 'Up to 2 per month',
  timezone                = 'Australia/Sydney',
  calendar_provider       = 'google',
  calendar_connected_at   = now() - interval '120 days',
  calendar_last_synced_at = now() - interval '4 minutes',
  preferred_window_days   = 'weekdays',
  preferred_window_start  = '09:00',
  preferred_window_end    = '17:00'
where id = '00000000-0000-0000-0000-00000000ec03';

-- Vendor users: the one-line credibility bio the request email's vendor card
-- renders (photo_url left NULL so the initials-monogram fallback shows).
update public.vendor_user set
  bio_one_liner = '8 years building treasury tooling at Workday and Snowflake before founding Alpha in 2024.'
where id = '00000000-0000-0000-0000-00000000a5a1';
update public.vendor_user set
  bio_one_liner = 'Led RevOps at two ASX-listed scale-ups; now helps finance teams shorten the close.'
where id = '00000000-0000-0000-0000-00000000b5b1';

-- Request Q1/Q2 heads (the short Fraunces head above each answer body; shared
-- one-source/two-renders with the email + the /exec/requests card).
update public.request set
  q1_head = 'Treasury automation for multi-entity finance teams',
  q2_head = 'Your operating-model rebuild is the peak-effort moment'
where id = '00000000-0000-0000-0000-0000000004a1';
update public.request set
  q1_head = 'Treasury automation for multi-entity finance teams',
  q2_head = 'Built for exactly your reconciliation phase'
where id = '00000000-0000-0000-0000-000000005301';

-- Nomination history for the synthetic execs. On a fresh test stack, 0019's
-- backfill ran before these execs existed (migrations precede the seed), so we
-- seed the equivalent open row here: one current standing nomination per exec
-- with a default charity, anchored at their created_at. Mirrors exactly what
-- 0019's backfill produces against an already-populated production DB.
insert into public.nomination_history (executive_id, charity_id, started_at)
select e.id, e.default_charity_id, e.created_at
from public.executive e
where e.default_charity_id is not null
  and not exists (
    select 1 from public.nomination_history nh where nh.executive_id = e.id
  );
