-- 003 — Aggiunge soli-boy e soli-multi-agents-factory a pm_projects.
-- Idempotente (ON CONFLICT su slug). Applicare via Supabase SQL Editor o psql.
-- Allinea la dashboard alla visibilità reale: soli-boy era assente ovunque;
-- soli-multi-agents-factory era nella KB (cross_project_repos) ma non in pm_projects.

INSERT INTO pm_projects (slug, name, description, kind, github_owner, github_repo, production_url, stack, tags) VALUES
('soli-boy', 'Soli-boy', 'Emulatore multipiattaforma per arcade e console handheld (GB/GBC/GBA), web + desktop + mobile', 'app',
 'soli92', 'soli-boy', 'https://soli-boy.vercel.app/',
 '["TypeScript","React","Vite","EmulatorJS","IndexedDB","Electron","Capacitor"]'::jsonb,
 '["emulator","games","pwa"]'::jsonb),

('soli-multi-agents-factory', 'Soli Multi-Agents Factory', 'Meta-framework agentico llm-wiki++: pattern, seed versionati e adapter multipli', 'library',
 'soli92', 'soli-multi-agents-factory', NULL,
 '["Markdown","llm-wiki++","Claude","Cursor"]'::jsonb,
 '["meta-framework","agents","llm-wiki"]'::jsonb)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  kind = EXCLUDED.kind,
  production_url = EXCLUDED.production_url,
  stack = EXCLUDED.stack,
  tags = EXCLUDED.tags,
  updated_at = NOW();
