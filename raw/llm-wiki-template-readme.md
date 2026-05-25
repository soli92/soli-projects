# LLM Wiki Template

> A reusable, agent-agnostic template for building LLM-maintained knowledge bases — personal or team.

Drop curated sources into `raw/`, and an LLM agent (Claude Code, Cursor, Codex, or any other)
compiles them into a structured, interlinked wiki you can query, synthesize, and grow over time.

Based on the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
proposed by Andrej Karpathy in April 2026.

---

## The idea in one paragraph

Stop retrieving. Start compiling. Your PDFs, articles, and notes are source code. The wiki is
a binary the LLM compiles them into — pre-synthesized, cross-linked, always ready. You curate
sources and ask questions; the LLM handles summarization, cross-referencing, filing, and the
tedious bookkeeping that makes humans abandon wikis.

> "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." — A. Karpathy

---

## What this template gives you

- **Agent-agnostic schema** in `AGENTS.md` — the single source of truth. Thin wrappers
  (`CLAUDE.md`, `.cursor/rules/wiki.md`) just point back to it, so the same wiki works across
  Claude Code, Cursor, Codex, and whatever comes next.
- **Two variants**: `research-project` (default) for studying a topic, and `tech-project` for
  documenting a codebase with ADRs, runbooks, and PR review.
- **Three canned prompts** for the canonical operations: ingest, query, lint.
- **Hard rule on citations**: every non-trivial claim must trace back to a raw source. This is
  the immune system against hallucinations cementing as facts.
- **A scratch zone** (`inbox/`) so you can dump messy notes without polluting `raw/`.
- **Append-only log** (`wiki/log.md`) for free audit trail.

---

## Quickstart

### 1. Use this template

Click "Use this template" on GitHub, or:

```bash
git clone https://github.com/<you>/llm-wiki-template my-knowledge-base
cd my-knowledge-base
rm -rf .git && git init
```

For a tech project, instead drop the contents into `docs/wiki/` of your existing repo and set
`active_variant: tech-project` in `AGENTS.md` §2.

### 2. Bootstrap

Open the folder in **Cursor** or **Claude Code** and tell the agent:

> Read `AGENTS.md` and bootstrap this wiki.

The agent will ask four questions (topic, source types, rough volume, variant), then write the
seed `wiki/index.md` and `wiki/log.md`.

### 3. Ingest your first source

Drop a file in `raw/`, then:

> Ingest `raw/<filename>`.

The agent reads the source, creates summary + concept + entity pages, links them with
`[[wikilinks]]`, and appends a log entry. A single source typically touches 5–15 wiki files.

### 4. Query and synthesize

Use the prompts in `prompts/`:

| Operation | Prompt | When to use it |
|---|---|---|
| **Ingest** | `prompts/ingest.md` | Add a new source |
| **Query** | `prompts/query.md` | Ask a question, optionally pin the answer |
| **Lint** | `prompts/lint.md` | Audit health, every ~10 ingests |

### 5. (Optional) Open in Obsidian

Install [Obsidian](https://obsidian.md), open the repo as a vault, switch to graph view.
Each new ingest densifies the graph — that's the "compounding" property in action.

---

## Folder layout

```
llm-wiki-template/
├── AGENTS.md                # SCHEMA — single source of truth (read this first)
├── CLAUDE.md                # → points to AGENTS.md (Claude Code convention)
├── .cursor/rules/wiki.md    # → points to AGENTS.md (Cursor convention)
├── README.md                # this file
├── raw/                     # immutable sources (LLM reads, never writes)
├── inbox/                   # human scratch — promote to raw/ when ready
├── wiki/                    # LLM-owned. Humans read; LLM writes.
│   ├── index.md
│   └── log.md
├── prompts/                 # canned prompts for ingest / query / lint
└── variants/                # research-project (default) and tech-project
```

---

## The three-layer architecture

```
LAYER 3  — SCHEMA           AGENTS.md, prompts/, variants/   (rules)
LAYER 2  — WIKI             wiki/                            (LLM-owned)
LAYER 1  — RAW SOURCES      raw/                             (immutable)
                            inbox/                           (human scratch)
```

- **Raw sources are immutable.** The agent reads them but never writes. You can always
  recompile the wiki from scratch.
- **The wiki is LLM-owned.** Humans read it; the agent writes it. Edits go through the agent,
  not by hand.
- **The schema rules everything.** Change `AGENTS.md` and every operation downstream changes.

---

## Design choices, briefly

**Why `AGENTS.md` and not just `CLAUDE.md`?** So the schema travels across agents. Claude Code,
Cursor, Codex, and whatever comes next all read the same rules. The two wrappers exist only
because those tools have their own filename conventions.

**Why `inbox/` separate from `raw/`?** `raw/` is supposed to be immutable. You need a low-friction
place to dump messy notes before they're ready to become sources. Without it, you either pollute
`raw/` or you don't write anything.

**Why mandatory citations?** The main failure mode of this pattern is LLM-generated summaries
getting cemented as truth, then linked to other generated summaries, with the wiki drifting
from reality. Citations are the only durable defense.

**Why two variants?** Tech-project wikis (live with code, get reviewed via PR, contain ADRs and
runbooks) and research-project wikis (live as standalone vaults, optimize for synthesis across
authors) genuinely need different rules. Forcing them into one schema makes both worse.

**Why English for the schema, mixed languages in content?** Schema is "code" and benefits from
being portable; content benefits from staying in the language of its source. The base policy is
provisional and revisitable once a clear pattern emerges.

---

## When NOT to use this pattern

- **Millions of changing documents** (customer support, legal corpora, public web): use **RAG**.
  This pattern doesn't scale and freshness becomes a problem.
- **Single-shot Q&A** where you don't care about persistence: just chat — don't build a wiki.
- **Highly regulated content** where every output needs verbatim chunk-level citations: RAG with
  citation traceability is the correct tool, not this.

This pattern shines for **bounded, curated corpora (~10–500 sources) where synthesis matters
more than retrieval**: research projects, books you're studying, internal architecture
knowledge, your own thinking over time.

---

## RAG vs LLM Wiki — the honest comparison

|  | RAG | LLM Wiki |
|---|---|---|
| Raw docs | Stay raw, chunked at query time | Compiled into structured pages |
| State | Stateless (every query starts over) | Stateful (knowledge compounds) |
| Best at | Lookup, fact retrieval, traceability | Synthesis, cross-source connections |
| Per-query cost | Cheap | Cheap (ingest is the cost) |
| Hallucination risk | Local to one answer | Can cement into "facts" — needs lint |
| Sweet spot | Millions of docs, changing | 10–500 curated sources, deep work |

They don't compete. They solve different problems.

---

## Credits

- Pattern by [Andrej Karpathy](https://x.com/karpathy/status/2039805659525644595) — original
  [gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
- Article that explains it well: ["Andrej Karpathy's LLM Wiki" by Urvil Joshi](https://medium.com/@urvvil08/andrej-karpathys-llm-wiki-create-your-own-knowledge-base-8779014accd5).
- Spiritual ancestor: Vannevar Bush, ["As We May Think" (1945)](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/) — the Memex.

---

## License

MIT — do whatever you want, no warranty.
