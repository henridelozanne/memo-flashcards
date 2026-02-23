# Cortx

Stack: Nuxt 3 + TypeScript + Tailwind + Pinia + Capacitor + SQLite

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure the required environment variables:

```bash
cp .env.example .env
```

### Required Variables

- `SENTRY_DSN`: Your Sentry project DSN for error tracking (get it from [sentry.io](https://sentry.io))
- `REVENUECAT_API_KEY_IOS`: RevenueCat API key for iOS subscriptions
- `WEB3FORMS_KEY`: Web3Forms access key for contact forms

Sentry is automatically disabled in development mode.

## Dev

```
npm run dev
```

## Build

```
npm run build
```

Tests

Unit

```
npm run test:unit
```

Capacitor commands

```
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
npx cap open android
```

## Data Layer

Data is stored locally using SQLite. The project includes a `lib/db.ts` data layer which:

- Initializes a local SQLite database and applies migrations on startup.
- Exposes a `useDb()` composable for CRUD operations on collections, cards, review sessions, and logs.
- Stores timestamps in UNIX ms, and uses soft-deletes (`deleted_at`).

Future: an export/import feature and Supabase-based sync will be added.

## Leitner & planning

This project includes a pure business module that implements a Leitner spaced-repetition scheduler. It's located at `app/lib/leitner.ts` and contains deterministic, pure functions (no DB or UI responsibilities).

Rules implemented:

- Compartments & intervals (days): 1 → 0, 2 → 1, 3 → 3, 4 → 7, 5 → 14, 6 → 30 (maintenance: +90 days after Correct in C6).
- "Almost" schedules half the interval (minimum 1 day). For compartment 1 (0d interval), "Almost" schedules +12 hours.
- "Wrong" resets to 1 day, except when in compartment 6 — then it moves back to compartment 3 and schedules +3 days.
- Archived cards are excluded from selection. The selection utility can also exclude all C6 cards via `excludeC6=true`.

This module is pure and will be wired into the data-layer and UI in subsequent steps.

## Authentication and Supabase

The app uses silent authentication via Supabase on startup, without requiring any visible user accounts. A unique anonymous user ID is automatically generated and used to link local data. While remote backup is not yet enabled, this lays the groundwork for future Supabase synchronization features.

Authentication is handled by the `useSupabaseAuth()` composable, which:

- Checks for an existing session or creates an anonymous one
- Stores the user ID in the local SQLite Meta table
- Provides a fallback to local UUID if auth fails

All data entities (collections, cards, sessions, logs) include a `user_id` field, preparing for future multi-user sync capabilities while maintaining strict data isolation even in offline mode.

## Synchronisation (préparation)

Le code prépare la synchronisation future avec Supabase :

- Toutes les entités sont scindées par `user_id` (données isolées par utilisateur, même en local)
- Les fonctions de synchronisation sont prêtes dans `lib/sync.ts` : `syncLocalToRemote`, `syncRemoteToLocal`, `isSyncNeeded` (stubs, à implémenter)
- Les migrations et le data layer sont prêts pour supporter la sync multi-utilisateur
- Les tests valident la structure et l’isolation des données

La synchronisation effective (push/pull, gestion des conflits) sera ajoutée dans un prompt ultérieur.

```

```
