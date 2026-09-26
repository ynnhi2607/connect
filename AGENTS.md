# AGENTS.md

This file provides guidance to OpenCode, Codex, and other coding agents working in this repository.

## Project Overview

- Project folder: `connect`
- Product / app name:
- Current visible brand in UI: `ConnectSpace`
- App type: React single-page frontend
- Main current surfaces: deep-ocean landing page and authentication page
- Backend/API owner:
- Deployment target:

## What This Repo Actually Is

This is a Vite + React + TypeScript frontend project. It is not a Unity project and not a backend service.

Key stack:

- React `19`
- TypeScript
- Vite
- Tailwind CSS `4`
- shadcn-style component setup via `components.json`
- Base UI primitives for shared UI components
- lucide-react icons
- Canvas 2D for the interactive auth-page ocean backdrop

## Current App Shape

Entry flow:

1. `src/main.tsx` mounts React into `#root`.
2. `src/App.tsx` renders `OceanPage` at `/` and `AuthPage` at `/auth`.
3. `src/pages/ocean/index.tsx` owns the two-scene landing experience.
4. `src/pages/auth/index.tsx` owns auth page state and form submission.

Implemented auth behavior:

- Login calls `POST /api/auth/login`.
- Registration calls `POST /api/auth/register`.
- Session restore calls `GET /api/auth/me`.
- JWT is stored in `localStorage` under `connectspace.jwt`.
- Vite proxies `/api` to `http://localhost:8080` during local development.

Unknown / not confirmed:

- Exact backend framework:
- Production API base URL:
- Auth token lifetime rules beyond the API response shape:
- Route structure beyond `/` and `/auth`:

## Repo Map

- `src/main.tsx` - React app bootstrap
- `src/App.tsx` - current top-level app component
- `src/pages/ocean/` - interactive deep-ocean landing page and its CSS
- `src/pages/auth/` - auth page, auth-specific components, and auth CSS
- `src/lib/auth.ts` - frontend API helpers and auth response types
- `src/components/ui/` - shared UI primitives
- `src/assets/` - frontend image/SVG assets
- `public/` - static files served by Vite
- `components.json` - shadcn-style aliases and UI configuration
- `vite.config.ts` - Vite plugins, API proxy, and `@` alias
- `eslint.config.js` - ESLint flat config
- `memory_bank/` - per-session workflow notes
- `dist/` - generated build output; do not treat as source
- `node_modules/` - installed dependencies; do not edit

## Commands

Use these from the `connect` directory:

- `npm run dev` - start the local Vite dev server
- `npm run build` - run TypeScript build mode and create a production Vite build
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

There is no separate `typecheck` script currently. Use `npm run build` for the closest type/build validation unless a dedicated script is added later.

## Working Rules For Agents

### Before changing code

1. Read the target files directly.
2. Check whether the change belongs in page code, shared UI components, `src/lib`, or config.
3. Preserve the existing Vite, React, Tailwind, and shadcn-style conventions unless the task explicitly asks for a different approach.
4. Keep generated folders (`dist`, `node_modules`) out of source edits.

### Frontend conventions

- Prefer React function components with TypeScript types.
- Keep page-specific code under `src/pages/...`.
- Keep reusable UI primitives under `src/components/ui`.
- Use the configured `@` alias when it matches nearby project style.
- Use lucide-react icons for common UI symbols.
- Avoid introducing new state management, routing, or styling frameworks unless the task requires them.
- Keep CSS responsive and verify text/layout at mobile and desktop widths when changing UI.

### API/auth conventions

- Keep auth API wrappers in `src/lib/auth.ts` unless the API layer grows enough to justify a new structure.
- The current frontend expects JSON responses.
- Surface API error messages from `detail`, `message`, or `error` when available.
- Do not hardcode production API URLs until the deployment/API environment is confirmed.

### Styling conventions

- Global theme tokens live in `src/index.css`.
- Auth-page styling lives in `src/pages/auth/auth.css`.
- Shared UI components use class-variance-authority and the `cn` helper.
- The current UI uses custom CSS plus Tailwind/shadcn tokens; match the local pattern before adding new abstractions.

## Validation Checklist

After changes, validate the closest relevant surface:

- Markdown-only changes: read the edited files for clarity and formatting.
- TypeScript/React changes: run `npm run build`.
- Lint-sensitive changes: run `npm run lint`.
- UI changes: run `npm run dev` and inspect the affected viewport(s) when feasible.
- Auth/API changes: confirm the expected `/api/auth/*` contract or clearly note that backend verification was not run.

## Workflow Memory Rule

Use `memory_bank/_session_template.md` as the source template for workflow memory files in this repo.

When a user starts a new substantial work session:

1. Read the full `memory_bank/_session_template.md` file before meaningful work.
2. Create a new session file in `memory_bank/` using the template structure, named like `YYYY-MM-DD-HHmm-short-title.md`.
3. Do not modify `memory_bank/_session_template.md` unless the user explicitly asks to update the template.
4. Do not create any `memory_bank/wf_*` files.

During a substantial conversation cycle:

1. Keep the current dated session file current as work progresses.
2. Update `Plan (Simple)` and `TODO List` whenever the plan or task state changes.
3. After finishing work, update `What Was Done`, `Files Touched`, `Key Decisions`, `Validation`, and `Blockers / Notes for Next Agent`.

Create or maintain a session file whenever you:

- edit code, config, or assets in a meaningful way
- complete a multi-step documentation update
- spend a long session investigating or fixing a bug
- leave partial progress another agent may need to continue

Skip it for tiny, no-change tasks such as a single factual answer or a short read-only lookup.

## Known Constraints And Pitfalls

- The root README is still the default Vite template and may not describe this product accurately.
- The backend contract is inferred only from `src/lib/auth.ts` and the Vite proxy.
- `OceanBackdrop.tsx` draws an interactive Canvas 2D scene; verify canvas rendering after changing it.
- Landing and auth should share the restrained deep-ocean palette, Instrument Serif display type, pale-gold highlights, and quiet motion.
- The current app has no confirmed production deployment configuration in this repo.
- Keep dependency and lockfile changes intentional; `package-lock.json` is committed.

## Documentation Targets

If you update docs for this repo, keep them grounded in these concrete sources first:

- `package.json`
- `vite.config.ts`
- `components.json`
- `src/App.tsx`
- `src/pages/auth/`
- `src/lib/auth.ts`
- `src/components/`
