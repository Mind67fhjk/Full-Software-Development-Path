-- ============================================================
-- STEP 1: Create tables
-- ============================================================

CREATE TABLE IF NOT EXISTS development_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL UNIQUE,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS development_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES development_phases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'development_steps_phase_id_order_index_key'
  ) THEN
    ALTER TABLE development_steps ADD CONSTRAINT development_steps_phase_id_order_index_key UNIQUE (phase_id, order_index);
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS step_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES development_steps(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add session_id column if it doesn't exist (upgrading from old schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'step_progress' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE step_progress ADD COLUMN session_id text NOT NULL DEFAULT 'legacy';
  END IF;
END$$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'step_progress_step_id_session_id_key'
  ) THEN
    ALTER TABLE step_progress ADD CONSTRAINT step_progress_step_id_session_id_key UNIQUE (step_id, session_id);
  END IF;
END$$;

-- Index for fast progress lookups by session
CREATE INDEX IF NOT EXISTS idx_step_progress_session ON step_progress(session_id);

-- ============================================================
-- STEP 2: Enable Row Level Security
-- ============================================================

ALTER TABLE development_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: RLS Policies
-- ============================================================

DROP POLICY IF EXISTS "anon_read_phases" ON development_phases;
CREATE POLICY "anon_read_phases" ON development_phases FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_steps" ON development_steps;
CREATE POLICY "anon_read_steps" ON development_steps FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_progress" ON step_progress;
CREATE POLICY "anon_read_progress" ON step_progress FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON step_progress;
CREATE POLICY "anon_insert_progress" ON step_progress FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON step_progress;
CREATE POLICY "anon_update_progress" ON step_progress FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- STEP 4: Seed Phases
-- ============================================================

INSERT INTO development_phases (name, description, order_index, icon, color) VALUES
('Planning & Requirements', 'Define project scope, gather requirements, and create a solid foundation for development', 1, 'ClipboardList', '#3B82F6'),
('Design & Architecture', 'Create UI/UX designs and system architecture decisions', 2, 'Palette', '#8B5CF6'),
('Database Design', 'Design and implement the database schema and relationships', 3, 'Database', '#10B981'),
('Backend Development', 'Build APIs, server logic, and business rules', 4, 'Server', '#F59E0B'),
('Frontend Development', 'Implement user interfaces and client-side functionality', 5, 'Monitor', '#EC4899'),
('Testing & Quality', 'Ensure code quality through testing and debugging', 6, 'CheckCircle', '#EF4444'),
('Deployment & DevOps', 'Deploy to production and set up monitoring', 7, 'Rocket', '#06B6D4'),
('Maintenance & Iteration', 'Monitor, update, and improve the application post-launch', 8, 'RefreshCw', '#6366F1')
ON CONFLICT (order_index) DO NOTHING;

-- ============================================================
-- STEP 5: Seed Steps
-- ============================================================

-- Phase 1: Planning & Requirements
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 1), 'Define Project Vision', 'Clearly articulate the purpose and goals of the project', 1, '{"items": ["Write a vision statement", "Define success metrics", "Identify target users", "Document core features"], "tips": ["Keep it concise and focused", "Make it measurable", "Get stakeholder buy-in"]}'),
((SELECT id FROM development_phases WHERE order_index = 1), 'Stakeholder Analysis', 'Identify all stakeholders and their requirements', 2, '{"items": ["List all stakeholders", "Document their needs", "Prioritize requirements", "Create communication plan"], "tips": ["Include end users in analysis", "Consider indirect stakeholders", "Document assumptions"]}'),
((SELECT id FROM development_phases WHERE order_index = 1), 'Technical Requirements', 'Document all technical specifications and constraints', 3, '{"items": ["Define technology stack", "Document constraints", "List integrations needed", "Security requirements"], "tips": ["Consider scalability early", "Document browser/device support", "Plan for data privacy"]}'),
((SELECT id FROM development_phases WHERE order_index = 1), 'Create Project Timeline', 'Establish realistic milestones and deadlines', 4, '{"items": ["Break down into sprints", "Set milestones", "Allocate resources", "Buffer for unknowns"], "tips": ["Pad estimates by 20%", "Build in review time", "Plan for iterations"]}'),
((SELECT id FROM development_phases WHERE order_index = 1), 'Risk Assessment', 'Identify potential risks and mitigation strategies', 5, '{"items": ["List technical risks", "Identify dependencies", "Document mitigation plans", "Create contingency plans"], "tips": ["Think about third-party risks", "Consider team capacity", "Document assumptions"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 2: Design & Architecture
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 2), 'Create Wireframes', 'Design low-fidelity layouts for all major screens', 1, '{"items": ["Sketch main layouts", "Define navigation flow", "Review with stakeholders", "Iterate on feedback"], "tips": ["Start with pen and paper", "Focus on structure not visuals", "Get feedback early"]}'),
((SELECT id FROM development_phases WHERE order_index = 2), 'Design System Setup', 'Establish visual guidelines and component library', 2, '{"items": ["Define color palette", "Select typography", "Create spacing system", "Build component library"], "tips": ["Use 8px grid system", "Limit font weights to 3", "Ensure accessibility contrast"]}'),
((SELECT id FROM development_phases WHERE order_index = 2), 'High-Fidelity Mockups', 'Create detailed visual designs for all screens', 3, '{"items": ["Design all screens", "Define interactions", "Create responsive versions", "Review with users"], "tips": ["Test on actual devices", "Consider all states", "Document animations"]}'),
((SELECT id FROM development_phases WHERE order_index = 2), 'System Architecture', 'Design the overall system structure and data flow', 4, '{"items": ["Create architecture diagram", "Define data flow", "Plan API structure", "Document decisions"], "tips": ["Keep it simple", "Plan for scale", "Consider caching strategy"]}'),
((SELECT id FROM development_phases WHERE order_index = 2), 'Prototyping', 'Build interactive prototypes for user testing', 5, '{"items": ["Create clickable prototype", "Test with users", "Gather feedback", "Iterate on design"], "tips": ["Use real copy when possible", "Test with actual users", "Document all feedback"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 3: Database Design
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 3), 'Entity Relationship Design', 'Identify all entities and their relationships', 1, '{"items": ["List all entities", "Define relationships", "Document cardinality", "Review with team"], "tips": ["Use ERD diagrams", "Consider future features", "Normalize appropriately"]}'),
((SELECT id FROM development_phases WHERE order_index = 3), 'Schema Design', 'Create detailed database schema with all tables', 2, '{"items": ["Define all tables", "Set data types", "Add constraints", "Plan indexes"], "tips": ["Use consistent naming", "Add created_at/updated_at", "Plan for soft deletes"]}'),
((SELECT id FROM development_phases WHERE order_index = 3), 'Migration Planning', 'Create migration strategy for schema changes', 3, '{"items": ["Write initial migrations", "Plan rollback strategy", "Test migrations", "Document process"], "tips": ["Version all migrations", "Test on staging first", "Backup before applying"]}'),
((SELECT id FROM development_phases WHERE order_index = 3), 'Indexing Strategy', 'Optimize database performance with proper indexing', 4, '{"items": ["Identify query patterns", "Create indexes", "Test performance", "Monitor slow queries"], "tips": ["Index foreign keys", "Avoid over-indexing", "Use composite indexes wisely"]}'),
((SELECT id FROM development_phases WHERE order_index = 3), 'Security & RLS', 'Implement Row Level Security policies', 5, '{"items": ["Define access patterns", "Write RLS policies", "Test all scenarios", "Document policies"], "tips": ["Test as different users", "Enable RLS on all tables", "Use auth.uid() for ownership"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 4: Backend Development
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 4), 'API Design', 'Define all API endpoints and data contracts', 1, '{"items": ["List all endpoints", "Define request/response", "Document authentication", "Create API docs"], "tips": ["Use RESTful conventions", "Version your APIs", "Document error responses"]}'),
((SELECT id FROM development_phases WHERE order_index = 4), 'Authentication System', 'Implement user authentication and authorization', 2, '{"items": ["Set up auth provider", "Implement login/signup", "Add password reset", "Test all flows"], "tips": ["Use established providers", "Handle session expiry", "Implement rate limiting"]}'),
((SELECT id FROM development_phases WHERE order_index = 4), 'Core Business Logic', 'Implement main application functionality', 3, '{"items": ["Build CRUD operations", "Implement business rules", "Add validation", "Handle errors gracefully"], "tips": ["Validate on server too", "Use transactions", "Log important events"]}'),
((SELECT id FROM development_phases WHERE order_index = 4), 'API Endpoints', 'Build all REST or GraphQL endpoints', 4, '{"items": ["Implement all endpoints", "Add input validation", "Handle errors properly", "Add rate limiting"], "tips": ["Return proper HTTP codes", "Use pagination for lists", "Implement caching"]}'),
((SELECT id FROM development_phases WHERE order_index = 4), 'Integration & Webhooks', 'Connect external services and handle webhooks', 5, '{"items": ["Integrate third-party APIs", "Handle webhooks", "Add retry logic", "Document integrations"], "tips": ["Use environment variables", "Implement idempotency", "Handle failures gracefully"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 5: Frontend Development
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 5), 'Project Setup', 'Initialize frontend project with proper tooling', 1, '{"items": ["Set up build tool", "Configure linting", "Add TypeScript", "Set up testing"], "tips": ["Use Vite for speed", "Configure path aliases", "Set up environment files"]}'),
((SELECT id FROM development_phases WHERE order_index = 5), 'Component Architecture', 'Build reusable component library', 2, '{"items": ["Create base components", "Build layout components", "Add form components", "Document usage"], "tips": ["Use composition", "Keep components small", "Use TypeScript props"]}'),
((SELECT id FROM development_phases WHERE order_index = 5), 'State Management', 'Implement application state management', 3, '{"items": ["Choose state solution", "Set up stores", "Handle async state", "Persist where needed"], "tips": ["Start simple", "Keep state close to use", "Use URL for key state"]}'),
((SELECT id FROM development_phases WHERE order_index = 5), 'API Integration', 'Connect frontend to backend APIs', 4, '{"items": ["Create API client", "Handle loading states", "Implement error handling", "Add caching"], "tips": ["Use React Query/SWR", "Handle offline state", "Show loading skeletons"]}'),
((SELECT id FROM development_phases WHERE order_index = 5), 'Responsive Design', 'Ensure UI works on all screen sizes', 5, '{"items": ["Test all breakpoints", "Handle touch events", "Optimize images", "Test on real devices"], "tips": ["Mobile-first approach", "Use responsive units", "Test landscape mode"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 6: Testing & Quality
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 6), 'Unit Testing', 'Write tests for individual functions and components', 1, '{"items": ["Set up test framework", "Write component tests", "Test utilities", "Achieve good coverage"], "tips": ["Test behavior not implementation", "Use testing library", "Mock external dependencies"]}'),
((SELECT id FROM development_phases WHERE order_index = 6), 'Integration Testing', 'Test how components work together', 2, '{"items": ["Test user flows", "Test API integration", "Handle edge cases", "Test error states"], "tips": ["Focus on critical paths", "Test happy and sad paths", "Use realistic data"]}'),
((SELECT id FROM development_phases WHERE order_index = 6), 'End-to-End Testing', 'Test complete user journeys', 3, '{"items": ["Set up E2E framework", "Test critical flows", "Handle async behavior", "Run in CI"], "tips": ["Use Playwright/Cypress", "Keep tests stable", "Reduce flaky tests"]}'),
((SELECT id FROM development_phases WHERE order_index = 6), 'Performance Optimization', 'Optimize app performance and load times', 4, '{"items": ["Audit bundle size", "Lazy load components", "Optimize images", "Monitor metrics"], "tips": ["Use Lighthouse", "Code split wisely", "Use modern formats"]}'),
((SELECT id FROM development_phases WHERE order_index = 6), 'Accessibility Audit', 'Ensure app is accessible to all users', 5, '{"items": ["Run accessibility audit", "Fix keyboard navigation", "Add ARIA labels", "Test with screen reader"], "tips": ["Follow WCAG 2.1 AA", "Use semantic HTML", "Test with real assistive tech"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 7: Deployment & DevOps
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 7), 'CI/CD Pipeline', 'Set up automated build and deployment pipeline', 1, '{"items": ["Configure CI", "Set up automated tests", "Add deployment stage", "Environment management"], "tips": ["Fail fast", "Cache dependencies", "Use secrets management"]}'),
((SELECT id FROM development_phases WHERE order_index = 7), 'Environment Configuration', 'Configure all environments properly', 2, '{"items": ["Set up staging", "Configure production", "Manage secrets", "Document setup"], "tips": ["Use env variables", "Keep envs in sync", "Never commit secrets"]}'),
((SELECT id FROM development_phases WHERE order_index = 7), 'Production Deployment', 'Deploy application to production servers', 3, '{"items": ["Run migrations", "Deploy build", "Verify deployment", "Set up rollback"], "tips": ["Deploy during low traffic", "Have rollback plan", "Monitor after deploy"]}'),
((SELECT id FROM development_phases WHERE order_index = 7), 'Monitoring Setup', 'Implement logging and monitoring', 4, '{"items": ["Set up error tracking", "Configure logs", "Add monitoring", "Create alerts"], "tips": ["Log meaningful events", "Set up dashboards", "Configure alert thresholds"]}'),
((SELECT id FROM development_phases WHERE order_index = 7), 'Performance Monitoring', 'Track application performance in production', 5, '{"items": ["Set up APM", "Track key metrics", "Monitor errors", "Set up alerts"], "tips": ["Monitor user experience", "Track business metrics", "Set up on-call rotation"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;

-- Phase 8: Maintenance & Iteration
INSERT INTO development_steps (phase_id, title, description, order_index, details) VALUES
((SELECT id FROM development_phases WHERE order_index = 8), 'User Feedback Collection', 'Gather and analyze user feedback', 1, '{"items": ["Set up feedback channel", "Analyze support tickets", "Track feature requests", "Prioritize improvements"], "tips": ["Make it easy to report", "Acknowledge all feedback", "Close the loop"]}'),
((SELECT id FROM development_phases WHERE order_index = 8), 'Bug Fixing', 'Address issues reported by users', 2, '{"items": ["Triage bugs", "Fix critical issues", "Update tests", "Communicate fixes"], "tips": ["Prioritize by impact", "Add regression tests", "Document workarounds"]}'),
((SELECT id FROM development_phases WHERE order_index = 8), 'Feature Iteration', 'Improve and expand features based on data', 3, '{"items": ["Analyze usage data", "Identify improvements", "Implement changes", "Measure impact"], "tips": ["Use data to decide", "Run A/B tests", "Track feature adoption"]}'),
((SELECT id FROM development_phases WHERE order_index = 8), 'Security Updates', 'Keep dependencies secure and updated', 4, '{"items": ["Monitor vulnerabilities", "Update dependencies", "Test updates", "Document changes"], "tips": ["Automate scanning", "Update regularly", "Have testing coverage"]}'),
((SELECT id FROM development_phases WHERE order_index = 8), 'Documentation', 'Maintain comprehensive documentation', 5, '{"items": ["Update API docs", "Document new features", "Keep README updated", "Add inline comments"], "tips": ["Document as you go", "Keep it simple", "Include examples"]}')
ON CONFLICT (phase_id, order_index) DO NOTHING;
