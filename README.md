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
npm run test
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

This project implements a Leitner spaced-repetition scheduler. The logic is embedded in `composables/useReviewSession.ts` and `composables/useCards.ts` (no longer a standalone file).

Rules implemented:

- Compartments & intervals (days): 1 → 1, 2 → 3, 3 → 7, 4 → 14, 5 → 30.
- "Almost" schedules half the interval (minimum 1 day).
- "Wrong" resets to compartment 1 (interval: 1 day).

This module is pure and will be wired into the data-layer and UI in subsequent steps.

## Authentication and Supabase

The app uses silent authentication via Supabase on startup, without requiring any visible user accounts. A unique anonymous user ID is automatically generated and used to link local data. While remote backup is not yet enabled, this lays the groundwork for future Supabase synchronization features.

Authentication is handled by the `useSupabaseAuth()` composable, which:

- Checks for an existing session or creates an anonymous one
- Stores the user ID in the local SQLite Meta table
- Provides a fallback to local UUID if auth fails

All data entities (collections, cards, sessions, logs) include a `user_id` field, preparing for future multi-user sync capabilities while maintaining strict data isolation even in offline mode.

## Synchronisation

La synchronisation avec Supabase est implémentée dans `lib/sync.ts` :

- `syncLocalToRemote` / `syncRemoteToLocal` : synchronisation bidirectionnelle des collections, cartes et profil utilisateur
- `isSyncNeeded` : vérifie si une synchronisation est nécessaire
- La synchronisation est déclenchée automatiquement via le middleware `middleware/sync.global.ts`

```

```
