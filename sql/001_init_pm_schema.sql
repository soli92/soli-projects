-- ============================================
-- Soli Projects — Schema iniziale
-- ============================================
-- Eseguire via Supabase SQL Editor o psql.
-- Idempotente: usa CREATE TABLE IF NOT EXISTS.

-- Estensioni (probabilmente gia' attive in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- pm_projects: anagrafica progetti
-- ============================================
CREATE TABLE IF NOT EXISTS pm_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('app', 'service', 'library')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'paused')),
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_branch TEXT NOT NULL DEFAULT 'main',
  production_url TEXT,
  stack JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pm_projects_kind_idx ON pm_projects (kind);
CREATE INDEX IF NOT EXISTS pm_projects_status_idx ON pm_projects (status);

-- ============================================
-- pm_ideas: idee/note libere agganciate a un progetto
-- ============================================
CREATE TABLE IF NOT EXISTS pm_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'refined', 'converted', 'discarded')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'agent', 'sync')),
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pm_ideas_project_id_idx ON pm_ideas (project_id);
CREATE INDEX IF NOT EXISTS pm_ideas_status_idx ON pm_ideas (status);

-- ============================================
-- pm_todos: task azionabili
-- ============================================
CREATE TABLE IF NOT EXISTS pm_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'dropped')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_hours NUMERIC(5,2),
  due_date DATE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'agent', 'sync', 'extracted')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pm_todos_project_id_idx ON pm_todos (project_id);
CREATE INDEX IF NOT EXISTS pm_todos_status_idx ON pm_todos (status);
CREATE INDEX IF NOT EXISTS pm_todos_priority_idx ON pm_todos (priority);

-- ============================================
-- pm_debt_items: debito tecnico estratto dai markdown
-- ============================================
CREATE TABLE IF NOT EXISTS pm_debt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'wontfix')),
  source_file TEXT,
  source_section TEXT,
  source_commit TEXT,
  auto_extracted BOOLEAN NOT NULL DEFAULT TRUE,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pm_debt_items_project_id_idx ON pm_debt_items (project_id);
CREATE INDEX IF NOT EXISTS pm_debt_items_severity_idx ON pm_debt_items (severity);
CREATE INDEX IF NOT EXISTS pm_debt_items_status_idx ON pm_debt_items (status);

-- ============================================
-- pm_snapshots: cache letture markdown da GitHub
-- ============================================
CREATE TABLE IF NOT EXISTS pm_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('ai_log', 'agents_md', 'weekly_log', 'readme')),
  raw_content TEXT NOT NULL,
  parsed_sections JSONB DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, source_type)
);

CREATE INDEX IF NOT EXISTS pm_snapshots_project_source_idx ON pm_snapshots (project_id, source_type);

-- ============================================
-- Trigger updated_at automatico
-- ============================================
CREATE OR REPLACE FUNCTION pm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pm_projects_updated_at ON pm_projects;
CREATE TRIGGER pm_projects_updated_at BEFORE UPDATE ON pm_projects
  FOR EACH ROW EXECUTE FUNCTION pm_set_updated_at();

DROP TRIGGER IF EXISTS pm_ideas_updated_at ON pm_ideas;
CREATE TRIGGER pm_ideas_updated_at BEFORE UPDATE ON pm_ideas
  FOR EACH ROW EXECUTE FUNCTION pm_set_updated_at();

DROP TRIGGER IF EXISTS pm_todos_updated_at ON pm_todos;
CREATE TRIGGER pm_todos_updated_at BEFORE UPDATE ON pm_todos
  FOR EACH ROW EXECUTE FUNCTION pm_set_updated_at();

DROP TRIGGER IF EXISTS pm_debt_items_updated_at ON pm_debt_items;
CREATE TRIGGER pm_debt_items_updated_at BEFORE UPDATE ON pm_debt_items
  FOR EACH ROW EXECUTE FUNCTION pm_set_updated_at();
