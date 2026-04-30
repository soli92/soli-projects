INSERT INTO pm_projects (slug, name, description, kind, github_owner, github_repo, production_url, stack, tags) VALUES
('soli-prof', 'Soli Prof', 'Tutor AI personale + knowledge base RAG multi-corpus', 'app',
 'soli92', 'soli-prof', 'https://soli-prof.vercel.app',
 '["Next.js 16","TypeScript","Tailwind","Supabase","Voyage","Claude"]'::jsonb,
 '["rag","ai","tutor"]'::jsonb),

('soli-agent', 'Soli Agent', 'Dev assistant con tool stack 45+ tool e sub-agenti', 'app',
 'soli92', 'soli-agent', 'https://soli-agent.vercel.app',
 '["Next.js 16","TypeScript","Anthropic","OpenAI","Gemini","Tailwind"]'::jsonb,
 '["ai","agent","copilot"]'::jsonb),

('soli-projects', 'Soli Projects', 'Portfolio personale e copilot di project management', 'app',
 'soli92', 'soli-projects', 'https://soli-projects.vercel.app',
 '["Next.js 16","TypeScript","Tailwind","Supabase"]'::jsonb,
 '["pm","portfolio"]'::jsonb),

('soli-dome', 'Soli Dome', 'Portale personale: home links per le mie app', 'app',
 'soli92', 'soli-dome', 'https://soli-dome.vercel.app',
 '["Next.js 16","TypeScript","Tailwind"]'::jsonb,
 '["portal"]'::jsonb),

('solids', 'SoliDS', 'Design system: token, CSS, Storybook, registry shadcn', 'library',
 'soli92', 'solids', 'https://soli92.github.io/solids/',
 '["TypeScript","Tailwind","Storybook","CSS variables"]'::jsonb,
 '["design-system","library"]'::jsonb),

('casa-mia-be', 'Casa Mia Backend', 'Backend Express + Prisma per gestione domestica', 'service',
 'soli92', 'casa-mia-be', 'https://casa-mia-be.onrender.com',
 '["Node.js","Express","Prisma","Postgres","JWT","WebSocket"]'::jsonb,
 '["backend"]'::jsonb),

('casa-mia-fe', 'Casa Mia Frontend', 'Frontend Next.js per gestione domestica', 'app',
 'soli92', 'casa-mia-fe', 'https://casa-mia-fe.vercel.app',
 '["Next.js","React","Tailwind","Axios","WebSocket"]'::jsonb,
 '["frontend"]'::jsonb),

('soli-dm-be', 'Soli DM Backend', 'API D&D 5e: campagne, personaggi, dadi, wiki SRD', 'service',
 'soli92', 'soli-dm-be', 'https://soli-dm-be.onrender.com',
 '["Express","TypeScript","Supabase"]'::jsonb,
 '["backend","dnd"]'::jsonb),

('soli-dm-fe', 'Soli DM Frontend', 'Frontend Next.js per Soli Dungeon Master', 'app',
 'soli92', 'soli-dm-fe', 'https://soli-dm-fe.vercel.app',
 '["Next.js","React","TypeScript","Tailwind","Supabase Auth"]'::jsonb,
 '["frontend","dnd"]'::jsonb),

('bachelor-party-claudiano', 'Bachelor Party', 'App per organizzare addio al celibato (spese, missioni, chat)', 'app',
 'soli92', 'bachelor-party-claudiano', NULL,
 '["Vite","React","Supabase","PWA"]'::jsonb,
 '["frontend","party"]'::jsonb),

('health-wand-and-fire', 'Health, Wand and Fire', 'Fantasy arcade space shooter con AI director', 'app',
 'soli92', 'health-wand-and-fire', 'https://health-wand-and-fire.vercel.app',
 '["React","Vite","TypeScript","Express","Anthropic"]'::jsonb,
 '["game","ai"]'::jsonb),

('pippify', 'Pippify', 'TBD - Aggiornare descrizione con info reali del repo', 'app',
 'soli92', 'pippify', NULL,
 '[]'::jsonb,
 '[]'::jsonb),

('soli-platform', 'Soli Platform', 'Monorepo futuro per microservizi condivisi', 'service',
 'soli92', 'soli-platform', NULL,
 '[]'::jsonb,
 '["monorepo","platform"]'::jsonb),

('koollector', 'Koollector', 'TBD - Aggiornare descrizione con info reali del repo', 'app',
 'soli92', 'koollector', NULL,
 '[]'::jsonb,
 '[]'::jsonb)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  kind = EXCLUDED.kind,
  production_url = EXCLUDED.production_url,
  stack = EXCLUDED.stack,
  tags = EXCLUDED.tags,
  updated_at = NOW();
