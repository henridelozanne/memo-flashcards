# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Migrated API keys to environment variables
- Secured Web3Forms API key (moved to `.env`)
- Comprehensive documentation of environment variables in `.env.example`

## [0.1.0] - 2024-XX-XX

### Added

- ✨ Flashcard system with creation and editing
- 📚 Organization by collections
- 🧠 Spaced repetition algorithm for optimal learning
- 📊 Detailed review statistics
- 📅 Monthly progress calendar
- 📈 Compartment charts and hourly review graphs
- 🔔 Daily notifications for reviews
- 🌍 Multi-language support (EN, FR, ES, IT, PT, RU, JA, ZH)
- 📝 Rich text editor (TipTap) for content
- 💾 Local storage with SQLite
- ☁️ Optional synchronization with Supabase
- 💰 Subscription system via RevenueCat
- 🔒 User authentication with Supabase Auth
- 📱 Native iOS app via Capacitor
- 🐛 Bug report and feature request forms
- 📊 Analytics with PostHog
- 🔍 Error monitoring with Sentry
- 🎨 Modern UI with Tailwind CSS
- ⚡ Practice mode with customizable options
- 🎯 Review session end screen with statistics

### Technical

- Stack: Nuxt 3 + Vue 3 + TypeScript
- State management: Pinia
- Database: SQLite (via Capacitor)
- Optional backend: Supabase
- Testing: Vitest
- Linting: ESLint + Prettier

---

[Unreleased]: https://github.com/henridelozanne/memo-flashcards/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/henridelozanne/memo-flashcards/releases/tag/v0.1.0
