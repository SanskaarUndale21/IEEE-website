-- IEEE SGBIT website schema
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Safe to re-run: every statement is idempotent.
--
-- Security model: Row Level Security is ON for every table and NO policies are
-- defined, so the public anon key can read or write nothing. All access goes
-- through the Next.js server using the service role key, which never reaches
-- the browser.

create extension if not exists pgcrypto;

-- ─── Helpers ──────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Events ───────────────────────────────────────────────────────────────
create table if not exists public.events (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique
                         check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title                text not null check (char_length(title) between 1 and 160),
  date_label           text not null default '' check (char_length(date_label) <= 80),
  event_date           date,
  venue                text not null default '' check (char_length(venue) <= 200),
  description          text not null default '' check (char_length(description) <= 600),
  long_description     text not null default '' check (char_length(long_description) <= 8000),
  tags                 text[] not null default '{}',
  image_url            text not null default '' check (char_length(image_url) <= 500),
  gallery              text[] not null default '{}',
  status               text not null default 'upcoming' check (status in ('upcoming', 'past')),
  published            boolean not null default true,
  registration_open    boolean not null default false,
  fee_amount           integer not null default 0 check (fee_amount between 0 and 100000),
  payment_instructions text not null default '' check (char_length(payment_instructions) <= 1000),
  max_registrations    integer check (max_registrations is null or max_registrations > 0),
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

create index if not exists events_status_idx on public.events (status, published, sort_order);

-- ─── Membership applications (/join) ──────────────────────────────────────
create table if not exists public.memberships (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 1 and 120),
  email             text not null check (char_length(email) <= 200),
  semester          text not null default '' check (char_length(semester) <= 10),
  branch            text not null default '' check (char_length(branch) <= 80),
  dob               date,
  contact           text not null default '' check (char_length(contact) <= 30),
  security_question text not null default '' check (char_length(security_question) <= 200),
  security_answer   text not null default '' check (char_length(security_answer) <= 200),
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note        text not null default '' check (char_length(admin_note) <= 1000),
  ip_hash           text not null default '',
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz
);

create index if not exists memberships_created_idx on public.memberships (created_at desc);
create index if not exists memberships_ip_idx on public.memberships (ip_hash, created_at);

-- ─── Contact queries (homepage contact box) ───────────────────────────────
create table if not exists public.queries (
  id          uuid primary key default gen_random_uuid(),
  email       text not null default '' check (char_length(email) <= 200),
  phone       text not null default '' check (char_length(phone) <= 30),
  topic       text not null default '' check (char_length(topic) <= 2000),
  status      text not null default 'open' check (status in ('open', 'resolved')),
  ip_hash     text not null default '',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists queries_created_idx on public.queries (created_at desc);
create index if not exists queries_ip_idx on public.queries (ip_hash, created_at);

-- ─── Event registrations ──────────────────────────────────────────────────
create table if not exists public.event_registrations (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references public.events (id) on delete cascade,
  name               text not null check (char_length(name) between 1 and 120),
  email              text not null check (char_length(email) <= 200),
  phone              text not null check (char_length(phone) <= 30),
  usn                text not null default '' check (char_length(usn) <= 30),
  college            text not null default '' check (char_length(college) <= 160),
  branch             text not null default '' check (char_length(branch) <= 80),
  semester           text not null default '' check (char_length(semester) <= 10),
  team_name          text not null default '' check (char_length(team_name) <= 120),
  transaction_id     text not null default '' check (char_length(transaction_id) <= 80),
  payment_proof_path text,
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note         text not null default '' check (char_length(admin_note) <= 1000),
  ip_hash            text not null default '',
  created_at         timestamptz not null default now(),
  reviewed_at        timestamptz,
  unique (event_id, email)
);

create index if not exists registrations_event_idx on public.event_registrations (event_id, created_at desc);
create index if not exists registrations_ip_idx on public.event_registrations (ip_hash, created_at);

-- ─── Admin security tables ────────────────────────────────────────────────
create table if not exists public.admin_sessions (
  id          uuid primary key,
  admin_id    text not null,
  ua_hash     text not null,
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  expires_at  timestamptz not null,
  revoked     boolean not null default false
);

create table if not exists public.admin_login_attempts (
  id         bigserial primary key,
  ip_hash    text not null,
  success    boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_idx on public.admin_login_attempts (ip_hash, created_at desc);
create index if not exists login_attempts_time_idx on public.admin_login_attempts (created_at desc);

create table if not exists public.admin_audit_log (
  id         bigserial primary key,
  admin_id   text not null,
  action     text not null,
  target     text not null default '',
  meta       jsonb not null default '{}'::jsonb,
  ip_hash    text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists audit_created_idx on public.admin_audit_log (created_at desc);

-- ─── Lock everything down ─────────────────────────────────────────────────
alter table public.events               enable row level security;
alter table public.memberships          enable row level security;
alter table public.queries              enable row level security;
alter table public.event_registrations  enable row level security;
alter table public.admin_sessions       enable row level security;
alter table public.admin_login_attempts enable row level security;
alter table public.admin_audit_log      enable row level security;

alter table public.events               force row level security;
alter table public.memberships          force row level security;
alter table public.queries              force row level security;
alter table public.event_registrations  force row level security;
alter table public.admin_sessions       force row level security;
alter table public.admin_login_attempts force row level security;
alter table public.admin_audit_log      force row level security;

revoke all on public.events, public.memberships, public.queries, public.event_registrations,
              public.admin_sessions, public.admin_login_attempts, public.admin_audit_log
  from anon, authenticated;

-- ─── Storage buckets ──────────────────────────────────────────────────────
-- payment-proofs: PRIVATE. Only readable through short lived signed URLs the
-- admin API creates. event-images: public read, writes only via service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('payment-proofs', 'payment-proofs', false, 4194304, array['image/jpeg', 'image/png', 'image/webp']),
  ('event-images',   'event-images',   true,  4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ─── Seed the existing past events (skipped if the slug already exists) ───
insert into public.events (slug, title, date_label, description, long_description, tags, image_url, gallery, status, sort_order)
values
  ('ignition-2025', 'Ignition 2025', 'March 2025',
   'The flagship technical fest, a grand celebration of innovation, technology, and engineering excellence.',
   'Ignition 2025 was the flagship technical festival of IEEE SGBIT, a grand celebration of innovation, technology, and engineering excellence. The event featured multiple competitions, technical exhibitions, expert talks from industry leaders, coding challenges, and robotics demonstrations. Over 500 students participated across various events, making it one of the largest technical festivals in the region. The fest showcased cutting-edge projects in AI, IoT, robotics, and sustainable engineering, inspiring the next generation of innovators.',
   array['Technical Fest', 'Competitions', 'Exhibitions'], '/images/ignition2025.jpeg',
   array['/images/ig_2025(1).JPG', '/images/ig_25.jpeg', '/images/ig_25n.jpeg'], 'past', 1),
  ('nkcon-2024', 'NKCon 2024', 'November 2024',
   'National Knowledge Conference: insightful paper presentations, keynotes, and academic discourse on emerging tech.',
   'NKCon 2024 was a prestigious National Knowledge Conference that brought together researchers, industry experts, and students for a day of insightful paper presentations, keynote speeches, and stimulating academic discourse on emerging technologies. The conference covered topics ranging from artificial intelligence and machine learning to quantum computing and sustainable energy solutions. Distinguished speakers from leading tech companies and research institutions shared their insights, while students presented their research papers to a panel of expert judges.',
   array['Conference', 'Research', 'Keynotes'], '/images/nkcon2024.jfif', '{}', 'past', 2),
  ('wie-2024', 'WiE 2024', 'October 2024',
   'Women in Engineering: celebrating and empowering women in STEM through mentorship and workshops.',
   'Women in Engineering (WiE) 2024 was a landmark initiative celebrating and empowering women in STEM fields. The event featured mentorship programs pairing students with successful women engineers, hands-on workshops on emerging technologies, panel discussions with industry leaders, and inspiring success stories from women who have broken barriers in engineering. The event aimed to create a supportive community and address the gender gap in technology, encouraging more women to pursue careers in engineering and technology.',
   array['Women in Engineering', 'Empowerment', 'Mentorship'], '/images/wie24.jpg',
   array['/images/bec_wie_25.jpeg'], 'past', 3),
  ('hack-n-hunt', 'Hack-n-Hunt', 'September 2024',
   'Hackathon meets treasure hunt: coding meets problem-solving in a race against time.',
   'Hack-n-Hunt was an adrenaline-fueled event that combined the intensity of a hackathon with the excitement of a treasure hunt. Teams competed to solve complex coding challenges while simultaneously hunting for clues scattered across the campus. The event tested participants'' programming skills, logical thinking, teamwork, and time management. With innovative problem statements and challenging puzzles, Hack-n-Hunt pushed participants to think outside the box and develop creative solutions under pressure.',
   array['Hackathon', 'Coding', 'Innovation'], '/images/hack-n-hunt.jpg', '{}', 'past', 4),
  ('idea-2025', 'IDEA 2025', 'February 2025',
   'Innovation Design and Entrepreneurship Arena: pitch ideas, build prototypes, interact with mentors.',
   'IDEA 2025 (Innovation Design and Entrepreneurship Arena) provided a platform for students to pitch groundbreaking ideas, develop working prototypes, and interact with experienced mentors from the industry. The event featured multiple rounds including ideation, prototype development, and final pitching to a panel of investors and industry experts. Participants received mentorship on business model development, market analysis, and technical feasibility, making it a comprehensive entrepreneurship experience.',
   array['Innovation', 'Design', 'Entrepreneurship'], '/images/events/Idea_25.jpg', '{}', 'past', 5),
  ('vaad-2025', 'VAAD 2025', 'January 2025',
   'Discussion and debate forum fostering critical thinking on technology and societal topics.',
   'VAAD 2025 was a stimulating discussion and debate forum that fostered critical thinking and articulate communication on contemporary technological and societal topics. Participants engaged in structured debates on topics such as AI ethics, data privacy, sustainable technology, and the future of work. The event featured both formal debate rounds and open discussion panels, encouraging students to develop well-reasoned arguments and consider multiple perspectives on complex issues.',
   array['Discussion', 'Debate', 'Critical Thinking'], '/images/events/Vaad_2025.jpeg', '{}', 'past', 6),
  ('jam-2025', 'JAM 2025', 'January 2025',
   'Just A Minute: fast-paced speaking competition showcasing spontaneity and technical knowledge.',
   'JAM 2025 (Just A Minute) was a fast-paced, high-energy speaking competition where participants showcased their spontaneity, wit, and technical knowledge under intense time pressure. Each participant was given random topics and had to speak coherently and engagingly for exactly one minute without hesitation, repetition, or deviation. The event tested quick thinking, communication skills, and subject knowledge, making it one of the most entertaining and competitive events of the year.',
   array['Speaking', 'Competition', 'Quick Thinking'], '/images/events/jam_2025.jpg', '{}', 'past', 7),
  ('launch-2025', 'Launch 2025', 'August 2025',
   'Grand inauguration welcoming new members to the IEEE SGBIT family.',
   'Launch 2025 was the grand inauguration and orientation event that welcomed new members to the IEEE SGBIT family. The event set the tone for a year of innovation and technological exploration with keynote addresses from faculty advisors, demonstrations of past achievements, interactive sessions about IEEE membership benefits, and networking opportunities with senior members. New members were introduced to the various technical committees, special interest groups, and upcoming events planned for the academic year.',
   array['Inauguration', 'Orientation', 'Networking'], '/images/events/launch_2025.jpeg', '{}', 'past', 8)
on conflict (slug) do nothing;

-- A payment reference (UTR) can be used by only one registration.
create unique index if not exists event_registrations_transaction_unique
  on public.event_registrations (lower(transaction_id))
  where transaction_id <> '';
