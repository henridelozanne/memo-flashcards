# Memo Flashcards

Stack: Nuxt 3 + TypeScript + Tailwind + Pinia + Capacitor + SQLite

Installation

```
npm install
```

Dev

```
npm run dev
```

Build

```
npm run build
```

Tests

Unit

```
npm run test:unit
```

E2E

```
npm run test:e2e
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
```
