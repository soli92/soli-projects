---
type: synthesis
created: 2026-06-25
topic: auth-patterns
sources: [wiki/sources/soli-prof.md, wiki/sources/soli-projects.md, wiki/sources/soli-dm-fe.md, wiki/sources/bachelor-party-claudiano.md, wiki/sources/soli-dome.md, wiki/sources/soli-boy.md, wiki/concepts/supabase-integration.md]
---
# Auth Patterns — Confronto Cross-Repo

## Overview

L'ecosistema soli92 adotta approcci di autenticazione eterogenei in base alla natura di ogni applicazione: da sessioni in-memory con cookie httpOnly per il pannello admin di soli-prof, a Supabase Auth (email/password) per le app multi-utente come soli-dm-fe, fino all'assenza di auth per app stateless o puramente locali come soli-boy. Non esiste un layer auth condiviso: ogni repo sceglie il meccanismo più adatto al proprio contesto d'uso.

## Confronto per repo

| Repo | Approccio | Note |
|---|---|---|
| **soli-prof** | Sessioni in-memory + cookie httpOnly (password singola) | Admin panel protetto da `lib/admin-session.ts`; cookie firmato con secret; nessun utente esterno |
| **soli-projects** | HMAC password singola + sessione server | `lib/auth/` con HMAC session; env: `SOLI_PROJECTS_SESSION_SECRET` + `SOLI_PROJECTS_PASSWORD`; E2E su flusso login/logout/redirect |
| **soli-dm-fe** | Supabase Auth (email/password; OAuth configurabile) | Errori mappati in italiano da `formatAuthError()`; `lib/auth-errors.ts`; pagine auth in `app/(dm)/auth` |
| **bachelor-party-claudiano** | Supabase Auth P4 con ruoli evento | RPC `bpc_join_event` + `bpc_admin_set_member`; ruoli: admin, groom, partecipante; P0-P2 senza auth; SQL da eseguire manualmente |
| **soli-dome** | Nessuna auth | Portale pubblico di navigazione; nessun dato sensibile |
| **soli-boy** | Nessuna auth | App locale per emulazione ROM; dati su IndexedDB on-device |
| **soli-agent** | Non documentato nelle sorgenti | Web Chat PWA e Telegram Bot; accesso non documentato come protetto |

[^src: wiki/sources/soli-prof.md §Key files — `lib/admin-session.ts`: sessioni in-memory + cookie httpOnly]
[^src: wiki/sources/soli-projects.md §Stack — `lib/auth/` HMAC session; AGENTS.md §CI — env SOLI_PROJECTS_SESSION_SECRET + SOLI_PROJECTS_PASSWORD]
[^src: wiki/sources/soli-dm-fe.md §Stack — Auth: Supabase email/password; §Key files — `lib/auth-errors.ts`]
[^src: wiki/sources/bachelor-party-claudiano.md §Stack — Auth (P4): Supabase Auth; §Key integrations — RPC bpc_join_event]
[^src: wiki/concepts/supabase-integration.md §Key points — Supabase Auth: soli-dm-fe email/password, OAuth; P4 bachelor-party-claudiano con ruoli]

## Pattern emergenti

### 1. Password singola + HMAC per tool interni
soli-prof (admin panel) e soli-projects (intera app) usano un pattern di autenticazione a utente singolo basato su HMAC e cookie httpOnly. Questo è adatto a tool personali o dashboard interne dove non esiste un registro utenti.
[^src: wiki/sources/soli-prof.md §Key files — `lib/admin-session.ts`]
[^src: wiki/sources/soli-projects.md §Stack — `lib/auth/`]

### 2. Supabase Auth per app multi-utente
Le app destinate a più utenti (soli-dm-fe, bachelor-party-claudiano P4) delegano l'auth a Supabase, sfruttando email/password e la possibilità di configurare OAuth. Supabase Auth è la scelta naturale nei progetti che già usano Supabase come data layer.
[^src: wiki/concepts/supabase-integration.md §Key points — Supabase Auth]

### 3. Assenza di auth per app stateless o on-device
Le app senza dati condivisi sensibili (soli-dome, soli-boy) non implementano alcun meccanismo di autenticazione. soli-boy memorizza tutto localmente su IndexedDB; soli-dome è un portale di navigazione pubblico.
[^src: wiki/sources/soli-boy.md §Architettura — `src/storage/` adapter IndexedDB/filesystem + persistenza on-device]
[^src: wiki/sources/soli-dome.md §Summary — app di navigazione senza dati sensibili]

### 4. Ruoli e RBAC (solo bachelor-party-claudiano P4)
L'unico progetto con un sistema di ruoli esplicito è bachelor-party-claudiano P4: admin, groom, partecipante. La RLS di Supabase ha causato una ricorsione su policy auto-referenziante — edge case documentato.
[^src: wiki/sources/bachelor-party-claudiano.md §Known edge cases — RLS su bpc_event_members: policy auto-referenziante causa ricorsione]

### 5. Service role esclusivamente server-side
I progetti che usano Supabase espongono `NEXT_PUBLIC_SUPABASE_ANON_KEY` lato client e `SUPABASE_SERVICE_ROLE_KEY` solo server-side. Questo pattern è esplicito in soli-projects e documentato anche per soli-dm-be.
[^src: wiki/concepts/supabase-integration.md §Key points — Service role (server-only): soli-dm-be usa SUPABASE_SERVICE_KEY nel server, mai esposta al client]
[^src: wiki/sources/soli-projects.md §Supabase schema — SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY server-only; NEXT_PUBLIC_* client-side]

## Raccomandazione

- **Nuovi tool interni / admin dashboard mono-utente**: usare il pattern HMAC password singola + cookie httpOnly (come soli-projects). Semplice, zero dipendenze aggiuntive, sicuro per uso personale.
- **Nuove app multi-utente con Supabase**: adottare Supabase Auth (email/password). OAuth configurabile dalla dashboard senza modifiche al codice.
- **Service key**: non esporre mai `SUPABASE_SERVICE_ROLE_KEY` al client; usare sempre `anon_key` pubblico e service role solo in contesti server.
- **App stateless / on-device**: l'assenza di auth è corretta e non va aggiunta senza un requisito concreto.

> ℹ️ Informazione non disponibile nelle sorgenti attuali — da aggiungere al prossimo ingest: pattern auth di soli-agent (Web Chat + Telegram Bot), casa-mia-fe, koollector, soli-platform.

## Riferimenti

- [[supabase-integration]] — uso di Supabase Auth e service role nei progetti soli92
- [[deployment-patterns]] — env auth vars in CI (SOLI_PROJECTS_SESSION_SECRET, SOLI_PROJECTS_PASSWORD)
- [[soli-projects]] — `lib/auth/` HMAC session pattern
- [[soli-dm-fe]] — Supabase Auth email/password + formatAuthError
- [[bachelor-party-claudiano]] — Supabase Auth P4 con ruoli e RPC
