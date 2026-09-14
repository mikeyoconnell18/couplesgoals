# Supabase setup for Couples Goals

This guide connects two real accounts. Demo mode needs none of these steps.

## 1. Create the project

1. Create an account at Supabase and choose **New project**.
2. Save the database password in a password manager. It does not belong in this repository.
3. Wait for provisioning, then open **Project Settings → API**.
4. Copy **Project URL** and the public **anon/publishable key**. Never copy the service-role key into Expo.

## 2. Configure the app

Copy `.env.example` to `.env.local`, replace both placeholders, and restart Expo:

```sh
cp .env.example .env.local
npm start -- --clear
```

Expo embeds `EXPO_PUBLIC_*` values in the app, so only public client keys belong there.

## 3. Apply migrations

### Supabase CLI (recommended)

Install the CLI, authenticate, and copy the project reference from the dashboard URL:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For a local backend, use `supabase start` and `supabase db reset` instead.

### SQL Editor alternative

Open **SQL Editor → New query**. Run every file in `supabase/migrations` in filename order. Run each entire file once. The second migration adds atomic invite RPCs, idempotency constraints, indexes, weekly results, and Realtime tables.

## 4. Configure passwordless email

1. Open **Authentication → Providers → Email** and enable Email plus email OTP.
2. For OTP-code entry, edit the email template to include `{{ .Token }}`. Magic links may also use the app scheme.
3. Under **Authentication → URL Configuration**, set a development Site URL and add redirect URLs for `couplesgoals://`, your Expo development URL, and your deployed web URL.
4. Keep email confirmation enabled for production. Supabase's built-in mail service is rate-limited; configure custom SMTP before inviting real testers.

## 5. Realtime

The migration adds `goals`, `actions`, `check_ins`, `obligations`, and `activity_events` to `supabase_realtime`. Confirm them under **Database → Publications → supabase_realtime**. Do not expose tables by disabling RLS.

## 6. Verify RLS and two-user behavior

Use two private browser profiles or two devices. Sign in with different emails, have A create a couple, and have B enter A's code. Confirm B sees A's goal and A sees B's check-in without reloading. Then create a third account and confirm the code cannot be reused. Follow `supabase/tests/rls_checks.sql` and `MANUAL_TWO_USER_TEST.md` for isolation checks.

## Troubleshooting

- **No email:** check Auth logs, spam, email provider rate limits, and the template's `{{ .Token }}` variable.
- **Invalid or expired invite:** codes expire after seven days and are single-use. Regenerate from Settings while the couple has one member.
- **App shows Demo mode:** both environment variables must be set before Expo starts. Stop and restart with `npm start -- --clear`.
- **Updates are delayed:** verify Realtime publication membership and websocket access; foregrounding the app also refetches.
- **RLS error:** confirm migrations ran in order and the signed-in user has a profile and active membership.
- **Never use the service-role key:** rotate it immediately if it was placed in a mobile environment file.
