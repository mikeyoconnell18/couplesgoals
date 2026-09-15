# Couples Goals

A mobile-first Expo app for two partners to build shared momentum through goals, fast honor-system check-ins, Weekly Showdowns, and playful consequences. The Mexico sample remains available without credentials.

The connected experience also includes contextual activity reactions and comments, lightweight couple notes, and an in-app notification center. These are deliberately scoped to shared goal activity rather than general messaging.

Actions explicitly support **individual** work with an accountability partner, one **joint** completion logged by either person, and **parallel** progress tracked separately for both partners. The UI describes these as “Who’s doing this?” rather than exposing database terminology.

> The requested baseline is Expo SDK 57. Confirm `package.json` and run `npx expo-doctor@latest` after installing; this workspace could not access npm or the remote SDK-upgrade branch, so dependency verification remains required before release.

## Requirements

- Node.js 22 LTS and npm
- Current Expo Go, Xcode/iOS Simulator, or Android Studio
- Supabase CLI for local/CLI database setup
- EAS CLI and Expo account only for cloud builds

## Install and run

```sh
npm install
npm start
```

Press `i`, `a`, or `w` in Expo for iOS, Android, or web. Equivalent commands are `npm run ios`, `npm run android`, and `npm run web`. Export the web app with `npx expo export --platform web`.

## Demo mode

Leave both Supabase variables unset. The app clearly labels Demo mode, loads the Mexico sample, supports local check-ins, and never claims they are synchronized. Use **Profile → Reset demo** to restore sample state. Demo data is intentionally in memory; real-mode data persists in Postgres.

## Real two-person mode

Copy the environment template and use only Supabase's public client values:

```sh
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
npm start -- --clear
```

The client never uses a service-role key. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create the project, apply migrations, configure email OTP and redirect URLs, enable Realtime, and verify RLS. When configured, authentication errors are shown; the app does not silently fall back to demo mode.

## Database migrations

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For local Supabase use `supabase start` followed by `supabase db reset`. Migrations are append-only: the two-person slice extends the foundation with atomic pairing RPCs, idempotency constraints, weekly history, reconciliation, indexes, and Realtime publication entries. `20260914220000_connected_experience.sql` adds couple-scoped reactions, contextual comments, in-app notifications, notification triggers, RLS, and their Realtime publication entries. `20260915200000_action_participation.sql` safely classifies existing actions, adds individual accountability, enforces one joint occurrence, and keeps parallel check-ins separate per partner.

## Test two accounts

Follow [MANUAL_TWO_USER_TEST.md](MANUAL_TWO_USER_TEST.md) with two devices or isolated browsers. It covers pairing, realtime goal/check-in updates, Momentum, reconciliation, fulfillment, persistence, and cross-couple isolation.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npx expo-doctor@latest
```

## EAS builds

Install and authenticate EAS CLI, configure the public environment variables as EAS environment variables, verify unique bundle/package identifiers in `app.json`, then run `eas build --platform ios` or `eas build --platform android`. Apple and Google developer accounts are required for store builds. Never add secret server credentials to an EAS client build.
