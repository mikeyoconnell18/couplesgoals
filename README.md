# Couples Goals

A mobile-first Expo app for couples to build shared momentum through meaningful goals, tiny actions, celebrations, and playful stakes. The current vertical slice is a credential-free Mexico preparation dashboard: quick logging updates the shared Momentum score immediately.

## Included foundation

- Expo Router tabs for Today, Goals, Together, Owed, and Profile
- Warm cream, raspberry, plum, coral, teal, and lime theme
- Pure recurrence and Couple Momentum domain functions with tests
- Typed Supabase environment boundary that leaves demo mode available without credentials
- Initial Postgres model, couple-scoped RLS, two-person membership enforcement, and Mexico seed helper
- EAS build profiles; paywall remains disabled

## Local setup

Prerequisites: Node 22+, npm, and (for backend work) the Supabase CLI.

```sh
npm install
cp .env.example .env.local
npm start
```

The app intentionally runs its first slice from local demo state if Supabase variables are absent. For a connected project, place the public project URL and anon key in `.env.local`. Never place a service-role key in the app.

## Supabase

```sh
supabase start
supabase db reset
```

Create two Auth users and their `profiles`, create a couple and memberships, then call `select public.seed_mexico_demo('<couple-id>', '<creator-user-id>');` locally. `supabase/seed.sql` installs that helper during reset. The schema stores timestamps as `timestamptz` and one shared IANA time zone on each couple.

RLS checks are documented in `supabase/tests/rls_checks.sql`. Photo storage policies are deliberately deferred until the photo-upload slice creates a bucket.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
```

## Credential-dependent next steps

- Link a Supabase project and configure Auth redirect URLs for `couplesgoals://`.
- Add generated database types after the first remote migration.
- Configure notification credentials when reminders are implemented.
- Add RevenueCat public SDK keys when subscriptions are implemented; the paywall flag stays `false` during internal testing.

## Next vertical slices

Authentication and secure invite acceptance come next, followed by persisted goal/action/check-in editing. Consequence evaluation, competitions, obligations, Weekly Showdown, notifications, and subscriptions follow the sequence in `CODEX_BUILD_BRIEF.md`.
