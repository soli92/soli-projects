---
type: entity-product
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-agent-agents.md, soli-projects-agents.md]
status: draft
---
# Anthropic Claude

> Large Language Model di Anthropic, usato come motore AI principale nell'ecosistema soli92 (Haiku, Sonnet, Opus).

## Usage in ecosystem

Claude e il LLM primario dell'ecosistema soli92, usato tramite `@anthropic-ai/sdk` in diversi profili (Haiku, Sonnet, Opus) a seconda del contesto [^src: raw/tech_stack.md §Stack comune].

| Progetto | Modello / Uso |
|----------|--------------|
| [[soli-prof]] | Claude Haiku 3.5 per il tutor AI con RAG e Generative UI |
| [[soli-agent]] | Multi-modello (Haiku/Sonnet/Opus) con model routing e circuit breaker |
| [[soli-projects]] | Claude via `@anthropic-ai/sdk` per il copilot della KB |

### soli-agent (uso avanzato)

- **Model routing**: supporta tier nano/low/medium/premium con sticky session e circuit breaker su Redis [^src: raw/soli-agent-agents.md §Model routing]
- **Token counting**: `messages.countTokens` prima di ogni `messages.create` per tracciamento costi [^src: raw/soli-agent-agents.md §Anthropic]
- **Prompt cache**: `SOLI_ANTHROPIC_PROMPT_CACHE` con `cache_control` sul blocco statico se i token stimati del prefisso superano la soglia minima [^src: raw/soli-agent-agents.md §Anthropic]
- **Tetto contesto**: `SOLI_MAX_APPROX_CONTEXT_INPUT_TOKENS` con `applyMessageWindow` per budget dinamico [^src: raw/soli-agent-agents.md §Anthropic]
- **Pricing model-aware**: `getAnthropicPricingForModel` con profili separati per Opus/Sonnet/Haiku [^src: raw/soli-agent-agents.md §Usage metrics]
- **Sub-agent**: ruoli specializzati (frontend, backend, graphic-designer, ecc.) con spawn_sub_agent e persistenza stato su Redis [^src: raw/soli-agent-agents.md §Sub-agent roles]

### soli-prof (tutor)

- **Modello fisso**: Claude Haiku 3.5 [^src: raw/soli-prof-agents.md §Stack tecnico]
- **System prompt**: tutor personale in italiano, breve e pratico [^src: raw/soli-prof-agents.md §System Prompt]
- **RAG-augmented**: le risposte sono arricchite con contesto dal vector store pgvector [^src: raw/soli-prof-agents.md §RAG]
- **Generative UI**: tool `show_tutor_focus_card` con stream NDJSON [^src: raw/soli-prof-agents.md §API endpoint]
- **`@anthropic-ai/sdk` come dipendenza diretta**: deve restare nel manifest; rimuoverla causa failure [^src: raw/soli-prof-agents.md §Known edge cases]

## Connections

- Related: [[rag-pipeline]] — Claude genera risposte RAG-augmented in soli-prof e soli-agent
- Related: [[supabase-integration]] — i costi e metriche possono essere persistiti via Supabase
- Related: [[deployment-patterns]] — le API key vanno in Vercel Environment Variables
- Related: [[vercel]] — `ANTHROPIC_API_KEY` come secret nei progetti Vercel
