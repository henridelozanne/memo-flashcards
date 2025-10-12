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

## Leitner & planning

This project includes a pure business module that implements a Leitner spaced-repetition scheduler. It's located at `app/lib/leitner.ts` and contains deterministic, pure functions (no DB or UI responsibilities).

Rules implemented:

- Compartments & intervals (days): 1 → 0, 2 → 1, 3 → 3, 4 → 7, 5 → 14, 6 → 30 (maintenance: +90 days after Correct in C6).
- "Almost" schedules half the interval (minimum 1 day). For compartment 1 (0d interval), "Almost" schedules +12 hours.
- "Wrong" resets to 1 day, except when in compartment 6 — then it moves back to compartment 3 and schedules +3 days.
- Archived cards are excluded from selection. The selection utility can also exclude all C6 cards via `excludeC6=true`.

This module is pure and will be wired into the data-layer and UI in subsequent steps.

```
