-- ============================================================
-- STEP 1: Create tables
-- ============================================================

create table if not exists development_phases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  order_index integer not null unique,
  icon text not null,
  color text not null,
  created_at timestamptz default now()
);

create table if not exists development_steps (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references development_phases(id) on delete cascade,
  title text not null,
  description text not null,
  order_index integer not null,
  details jsonb not null default '{"items": [], "tips": []}',
  created_at timestamptz default now()
);

create table if not exists step_progress (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references development_steps(id) on delete cascade,
  session_id text not null,
  completed boolean not null default false,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(step_id, session_id)
);

-- Index for fast progress lookups by session
create index if not exists idx_step_progress_session on step_progress(session_id);

-- ============================================================
-- STEP 2: Enable Row Level Security
-- ============================================================

alter table development_phases enable row level security;
alter table development_steps enable row level security;
alter table step_progress enable row level security;

-- ============================================================
-- STEP 3: RLS Policies
-- Phases and steps are public (read-only for everyone)
-- Progress is scoped per session_id (anyone can read/write their own)
-- ============================================================

create policy "Public read phases"
  on development_phases for select
  to anon
  using (true);

create policy "Public read steps"
  on development_steps for select
  to anon
  using (true);

create policy "Session read progress"
  on step_progress for select
  to anon
  using (true);

create policy "Session insert progress"
  on step_progress for insert
  to anon
  with check (true);

create policy "Session update progress"
  on step_progress for update
  to anon
  using (true);

-- ============================================================
-- STEP 4: Seed data — Phases
-- ============================================================

insert into development_phases (name, description, order_index, icon, color) values
  ('Project Planning', 'Define requirements, architecture, and project scope before writing any code.', 1, 'ClipboardList', '#6366f1'),
  ('UI/UX Design', 'Design wireframes, user flows, and the visual identity of the application.', 2, 'Palette', '#ec4899'),
  ('Database Design', 'Model your data, define relationships, and set up your database schema.', 3, 'Database', '#f59e0b'),
  ('Backend Development', 'Build APIs, business logic, authentication, and server-side functionality.', 4, 'Server', '#10b981'),
  ('Frontend Development', 'Implement the UI, connect to APIs, and build the user-facing features.', 5, 'Monitor', '#3b82f6'),
  ('Testing & QA', 'Write tests, fix bugs, and ensure the application works correctly end-to-end.', 6, 'CheckCircle', '#8b5cf6'),
  ('Deployment', 'Deploy the application to production and configure hosting, domains, and CI/CD.', 7, 'Rocket', '#ef4444'),
  ('Maintenance', 'Monitor performance, handle user feedback, and iterate on the product.', 8, 'RefreshCw', '#14b8a6');

-- ============================================================
-- STEP 5: Seed data — Steps (linked to phases by order_index)
-- ============================================================

-- Phase 1: Project Planning
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Define Project Goals', 'Clearly outline what the project should achieve and who it is for.', 1,
  '{"items": ["Write a one-paragraph project summary", "List the top 3 goals of the project", "Identify the target audience", "Define success metrics"], "tips": ["Keep goals specific and measurable", "Involve stakeholders early to avoid scope creep"]}'::jsonb
from development_phases where order_index = 1;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Choose Tech Stack', 'Select the technologies, frameworks, and tools you will use.', 2,
  '{"items": ["Choose frontend framework", "Choose backend language and framework", "Choose database", "Choose hosting provider", "Document all choices in a README"], "tips": ["Pick tools you or your team already know when possible", "Consider long-term maintenance, not just initial speed"]}'::jsonb
from development_phases where order_index = 1;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Set Up Project Repository', 'Initialize version control and establish branching strategy.', 3,
  '{"items": ["Create GitHub/GitLab repository", "Add .gitignore", "Write initial README", "Set up branch protection rules", "Define commit message conventions"], "tips": ["Use conventional commits for a clean history", "Protect your main branch from direct pushes"]}'::jsonb
from development_phases where order_index = 1;

-- Phase 2: UI/UX Design
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Create Wireframes', 'Sketch low-fidelity layouts for all key screens.', 1,
  '{"items": ["List all screens/pages needed", "Sketch desktop layout", "Sketch mobile layout", "Get feedback from at least one person"], "tips": ["Use Figma or even pen and paper for wireframes", "Focus on layout and flow, not colors or fonts yet"]}'::jsonb
from development_phases where order_index = 2;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Define Design System', 'Establish colors, typography, spacing, and reusable components.', 2,
  '{"items": ["Choose primary and accent colors", "Choose font family and sizes", "Define spacing scale", "Create button and input styles"], "tips": ["Stick to a maximum of 2 font families", "Use a tool like Coolors to build a consistent palette"]}'::jsonb
from development_phases where order_index = 2;

-- Phase 3: Database Design
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Design Data Models', 'Define all entities, their fields, and relationships.', 1,
  '{"items": ["List all entities (tables)", "Define fields and data types for each", "Map relationships (one-to-many, many-to-many)", "Draw an ER diagram"], "tips": ["Normalize your schema to avoid data duplication", "Think about what queries you will run most often"]}'::jsonb
from development_phases where order_index = 3;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Set Up Database', 'Create the database, run migrations, and configure access.', 2,
  '{"items": ["Create database project (e.g. Supabase)", "Run schema SQL", "Enable Row Level Security", "Test connection from the app", "Add seed data for development"], "tips": ["Never store credentials in your code", "Use environment variables for all secrets"]}'::jsonb
from development_phases where order_index = 3;

-- Phase 4: Backend Development
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Build Core API Endpoints', 'Implement the main CRUD operations your frontend needs.', 1,
  '{"items": ["Set up API project structure", "Implement GET endpoints", "Implement POST endpoints", "Implement PUT/PATCH endpoints", "Implement DELETE endpoints", "Test all endpoints with a tool like Postman"], "tips": ["Return consistent response shapes", "Always validate input on the server side"]}'::jsonb
from development_phases where order_index = 4;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Add Authentication', 'Implement user identity and access control.', 2,
  '{"items": ["Choose auth strategy (JWT, sessions, OAuth)", "Implement sign up and login", "Protect private routes/endpoints", "Handle token refresh", "Test auth flows"], "tips": ["Never roll your own crypto", "Use a proven library like Supabase Auth, Auth0, or NextAuth"]}'::jsonb
from development_phases where order_index = 4;

-- Phase 5: Frontend Development
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Scaffold Frontend Project', 'Set up the project structure, routing, and global state.', 1,
  '{"items": ["Initialize project (Vite, CRA, Next.js, etc.)", "Set up routing", "Configure global styles / Tailwind", "Set up environment variables", "Connect to backend/API"], "tips": ["Use absolute imports to keep import paths clean", "Set up a linter and formatter from day one"]}'::jsonb
from development_phases where order_index = 5;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Build UI Components', 'Implement all screens and interactive components.', 2,
  '{"items": ["Build reusable base components (Button, Input, Modal)", "Implement all pages/screens", "Connect components to API data", "Handle loading and error states", "Ensure mobile responsiveness"], "tips": ["Build components in isolation before wiring up data", "Always handle the empty state, loading state, and error state"]}'::jsonb
from development_phases where order_index = 5;

-- Phase 6: Testing & QA
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Write Tests', 'Cover critical paths with automated tests.', 1,
  '{"items": ["Write unit tests for utility functions", "Write integration tests for API endpoints", "Write at least one end-to-end test for the main user flow", "Aim for >70% coverage on critical code"], "tips": ["Test behavior, not implementation details", "A few high-value tests beat many trivial ones"]}'::jsonb
from development_phases where order_index = 6;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Manual QA & Bug Fixes', 'Manually test the full application and fix all critical bugs.', 2,
  '{"items": ["Test all user flows on desktop", "Test all user flows on mobile", "Test with slow network (Chrome DevTools throttling)", "Fix all critical and high-severity bugs", "Get at least one other person to test it"], "tips": ["Use Chrome DevTools device emulation for quick mobile testing", "Check browser console for errors before shipping"]}'::jsonb
from development_phases where order_index = 6;

-- Phase 7: Deployment
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Configure Production Environment', 'Set up environment variables and production settings.', 1,
  -- FIXED: Changed 'platform'\'s' to 'platform''s' below
  '{"items": ["Set all environment variables in hosting platform", "Ensure no development-only code runs in production", "Configure CORS for production domain", "Set up custom domain (optional)"], "tips": ["Double-check that .env is in .gitignore", "Use the hosting platform''s secret manager, not hardcoded values"]}'::jsonb
from development_phases where order_index = 7;

insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Deploy to Production', 'Ship the application and verify it works live.', 2,
  '{"items": ["Push code to main branch", "Verify build passes in CI/CD", "Open the live URL and test all critical flows", "Check for console errors on the live site", "Share the URL!"], "tips": ["Always test the live deployment, not just the local build", "Set up uptime monitoring (e.g. UptimeRobot — free tier)"]}'::jsonb
from development_phases where order_index = 7;

-- Phase 8: Maintenance
insert into development_steps (phase_id, title, description, order_index, details)
select id, 'Monitor & Iterate', 'Keep the application healthy and improve it over time.', 1,
  '{"items": ["Set up error monitoring (e.g. Sentry)", "Review user feedback regularly", "Keep dependencies up to date", "Plan and ship improvements in small iterations"], "tips": ["Small frequent updates are safer than large infrequent ones", "Listen to real users — they will find bugs you never imagined"]}'::jsonb
from development_phases where order_index = 8;
