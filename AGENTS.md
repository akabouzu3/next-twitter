# AGENTS.md

## Stack

Twitter/X-like fullstack app using Next.js 15 App Router, TypeScript, Auth.js v5, Prisma, PostgreSQL, Tailwind CSS v4, shadcn/ui, Zod, Server Actions, and Vercel.

## Commands

Use `pnpm` only.

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

Do not use `npm`, `yarn`, or `bun` unless explicitly requested.

## Protected Files

Do not edit these unless explicitly requested:

* `.env`
* `.env.*`
* `prisma/migrations/**`
* `prisma/migrations/migration_lock.toml`
* `pnpm-lock.yaml`
* `package.json`
* `next.config.*`
* `src/lib/auth/auth.ts`

Exceptions:

* `.env.example` may be updated for env var documentation.
* `package.json` and `pnpm-lock.yaml` may be changed together for requested dependency changes.
* `prisma/schema.prisma` may be changed for requested schema work, but do not create or edit migrations without approval.

## Architecture

* Use App Router only. Do not use Pages Router.
* Prefer Server Components and Server Actions.
* Add `"use client"` only for browser APIs, event handlers, or hooks.
* Prefer feature-based structure under `src/features/<domain>/`.
* Keep server logic, client logic, UI, and database access separated.
* Preserve existing patterns before adding new abstractions.

## Data And Validation

* All database access must happen on the server.
* Use `server-only` for server-only modules.
* Never import Prisma from Client Components.
* Prefer Prisma `select`, reusable query shapes, and mappers.
* Avoid overfetching and large nested `include` trees.
* Use cursor pagination for feeds with stable `createdAt DESC, id DESC` ordering.
* Validate forms, API inputs, search params, and Server Actions with Zod at boundaries.

## UI

* Use Tailwind utilities and existing shadcn/ui patterns first.
* Keep the UI close to modern X/Twitter: minimal, responsive, dark-mode friendly, subtle borders, smooth hover states, and sticky layouts where useful.
* Support keyboard navigation, semantic HTML, focus states, and accessible labels for icon buttons.
* Handle loading, empty, and error states.

## TypeScript And Code Style

* Strict TypeScript is required.
* Avoid `any` and unsafe assertions.
* Prefer inferred types, Prisma-generated types, and Zod-inferred types.
* Use kebab-case files, PascalCase components, and camelCase variables/functions.
* Keep components small and avoid unnecessary global state.
* Write comments only for architecture decisions, important constraints, or non-obvious behavior.
