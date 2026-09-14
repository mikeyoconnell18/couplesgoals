# Two-user acceptance test

1. Start two devices or isolated browser profiles; sign User A in by email OTP and create a named couple.
2. Copy the invite code. Sign User B in separately and join with that code.
3. As A, create a shared goal with a weekly action and a deterministic consequence.
4. Confirm B sees the goal without restarting.
5. As B, log the action; confirm success and that a repeated daily tap updates rather than duplicates.
6. Confirm A sees the update, current Momentum changes, and both see the same Weekly Showdown totals.
7. Set test dates so a missed period is closed, refresh the dashboard, and confirm exactly one obligation appears.
8. Refresh again and confirm no duplicate obligation is created.
9. Mark it fulfilled as the responsible user and confirm both clients show the updated state.
10. Edit and archive the goal as the other partner and confirm the change synchronizes.
11. Close and reopen both apps; sessions and database state must persist.
12. With a third account/couple, query captured IDs and confirm RLS denies every cross-couple read and mutation. Confirm the used invite and full couple cannot be joined.
