# Couple Goals — Product and Codex Build Brief

Status: V1 definition  
Working product name: Couple Goals  
Platform: Mobile-first Expo / React Native  
Repository: https://github.com/mikeyoconnell18/couplesgoals  
Business model target: $4.99 per couple per month  
Primary test users: Founding couple preparing for a Mexico trip  
Naming status: Couple Goals is a working title and category descriptor; conduct a distinct brand-name search before public launch

---

## 1. Purpose of this document

This is the canonical handoff for building Couple Goals. It captures the product thesis, V1 scope, goal system, consequence engine, engagement model, visual direction, data model, architecture, edge-case decisions, acceptance criteria, and the exact instructions a Codex coding workspace should follow.

When implementation details conflict with this document, preserve the product principles first and choose the simplest technical solution that supports them.

---

## 2. Product thesis

Couple Goals is a shared goals and accountability app for romantic partners.

It helps two people work toward meaningful outcomes together, support one another's personal commitments, celebrate milestones, and use playful consequences or friendly bets to make consistency more exciting.

The product is cooperative first. Competition is optional seasoning.

Core promise:

> Set goals together. Build momentum. Keep it interesting.

Alternative positioning line:

> A shared goals app for couples—with playful stakes that make follow-through more fun.

The product should feel like a tool that strengthens a relationship, not like a generic habit tracker with hearts added to it and not like a punishment app designed around constant competition.

---

## 3. Product principles

1. **The couple is the primary unit.** Individual activity should contribute to a shared sense of progress.
2. **Cooperation comes before competition.** Friendly bets are supported, but the main product is about building something together.
3. **Use the honor system.** The app is not a judge, surveillance system, or evidence tribunal.
4. **Keep consequences playful and meaningful.** Consequences create anticipation, affection, service, generosity, or lighthearted excitement.
5. **Everything stays editable.** Goals, actions, check-ins, milestones, competitions, consequence rules, and obligations can be edited.
6. **Transparency replaces enforcement.** Material changes appear in a lightweight activity history, but no partner approval is required.
7. **Progress should feel alive.** Couple Momentum, milestones, recaps, celebrations, and shared history turn repeated actions into a relationship story.
8. **Optimize for meaningful engagement, not screen time.** The app should prompt useful offline behavior and then get out of the way.
9. **One partner per person in V1.** Avoid groups, friend circles, families, and multiple simultaneous partnerships.
10. **Do not build payments or fulfillment into V1.** Partners settle cash, flowers, dinners, dates, and other consequences themselves.

---

## 4. Target customer and initial use case

### Primary customer

Couples who:

- Share a concrete goal or upcoming event
- Want more consistency without a serious coaching system
- Enjoy playful bets, rewards, or acts of service
- Want accountability without surveillance
- Already communicate well enough to use an honor system
- Prefer a lightweight consumer experience over spreadsheets or project-management tools

### Founding use case

A couple preparing for Mexico:

- Work out consistently
- Improve nutrition
- Reduce alcohol
- Save spending money
- Complete trip-planning milestones
- Run optional weekly fitness competitions
- Use consequences such as cooking dinner, buying flowers, planning date night, or paying for a shared experience

This should be included as development seed data.

---

## 5. V1 goal system

All listed goal types are pinned requirements. The app must also support a flexible custom goal.

### 5.1 Shared outcome goal

Both partners contribute toward one result.

Examples:

- Save $3,000 for Mexico
- Complete 30 workouts together
- Cook at home 20 times
- Take 10 phone-free evenings
- Plan and book the trip
- Read the same book
- Complete a home project
- Train for a race

Supported metrics:

- Boolean completion
- Count
- Currency
- Percentage
- Optional freeform progress note

### 5.2 Personal contribution goal

One partner owns the action, but the goal is visible to both and may contribute to Couple Momentum.

Examples:

- Work out four times per week
- Save $150 per week
- Avoid alcohol Monday through Thursday
- Hit a protein target five times per week
- Plan one date per month
- Practice Spanish three times per week

Ownership options:

- Me
- Partner
- Both, tracked separately

### 5.3 Shared habit goal

Both partners independently complete the same recurring action.

Examples:

- Both work out four times
- Both read for 20 minutes
- Both avoid takeout during the week
- Both complete a Sunday planning session

The interface should show each person's progress and the combined result.

### 5.4 Savings goal

A shared or individual contribution goal denominated in currency.

Examples:

- Save $3,000 for a trip
- Build a $10,000 emergency fund
- Save $500 for date experiences
- Reduce dining-out spending

V1 does not connect bank accounts. Contributions are logged manually.

### 5.5 Milestone goal

A larger objective divided into meaningful checkpoints.

Examples:

- Choose destination
- Book flights
- Reserve hotel
- Save first $1,000
- Complete 20 workouts
- Reach final preparation week

Milestones may have:

- Title
- Optional due date
- Optional numeric target
- Optional reward
- Completion state
- Completion timestamp

### 5.6 Friendly competition

Partners compete on one comparable metric during a defined period.

Examples:

- Most workouts this week
- Most consistent nutrition days
- Most money saved this month
- First to complete ten sessions
- Highest completion percentage

Competition is optional and visually secondary to shared progress.

V1 competition behavior:

- Both partners use the same metric
- A start and end date are required
- Winner is calculated from logged progress
- Tie means no winner by default
- Optional custom tie rule
- Optional consequence for loser
- Optional reward for winner
- Both can edit the competition at any time
- Changes appear in activity history
- Results can be manually corrected

### 5.7 Custom goal

A flexible goal builder for anything that does not fit a template.

Custom goal fields:

- Title
- Description
- Icon or emoji
- Owner: me, partner, shared, or both separately
- Metric type: yes/no, count, currency, percentage, or custom unit
- Unit label
- Start date
- Optional end date
- Cadence
- Target
- Milestones
- Consequence rules
- Rewards
- Optional competition mode
- Whether it contributes to Couple Momentum

Templates should accelerate setup but never constrain the user.

---

## 6. Core product objects

Use these terms consistently in code and UI.

### Goal

The larger objective or container.

Example: Get ready for Mexico.

### Action

A measurable behavior that advances a goal.

Example: Work out four times per week.

### Check-in

A logged unit of progress.

Example: Monday workout completed or $100 added to trip savings.

### Milestone

A meaningful checkpoint within a goal.

Example: Save the first $1,000.

### Consequence rule

A condition and result configured in advance.

Example: Miss a scheduled workout and cook dinner.

### Reward rule

A positive result triggered by achievement.

Example: Reach 20 workouts and choose the next date.

### Competition

A comparison between the partners over a defined metric and period.

Example: Most workouts this week.

### Obligation

A consequence or reward that has actually been triggered.

Example: Michael owes dinner.

### Couple Momentum

A shared progress indicator representing how consistently the couple is moving toward active goals.

### Weekly Showdown

A playful weekly recap of shared progress, wins, milestones, bets, and outstanding obligations. Despite the name, the recap should emphasize the couple's shared result before individual competition.

---

## 7. Cadence and measurement

V1 cadence options:

- One time
- Daily
- Selected weekdays
- Weekly target
- Monthly target
- Total target by end date

V1 metric types:

- Boolean
- Count
- Currency
- Percentage
- Custom numeric unit

Do not implement complex recurrence rules in V1. A simple selected-weekday and weekly/monthly target system covers most use cases.

Logging defaults:

- Check-ins can be created, edited, deleted, and backdated
- Notes are optional
- Photos are optional and are not treated as proof
- No partner verification is required
- Users can log progress for themselves
- For a shared goal, either partner can log shared progress
- Every material mutation may create an activity event

---

## 8. Consequence and reward engine

The consequence system is a defining product feature.

### 8.1 Supported trigger types

#### Per-occurrence miss

Example:

- Miss Tuesday's workout → cook dinner
- Skip date planning → handle dishes
- Miss a savings contribution → partner chooses the movie

#### Period target miss

Example:

- Complete fewer than four workouts this week → buy flowers
- Save less than $150 this week → plan a free date
- Miss the monthly planning goal → handle the next itinerary task

#### Competition loss

Example:

- Fewer workouts this week → pay for date night
- Lower consistency percentage → winner chooses Saturday plans
- Lose the savings sprint → make breakfast

#### Milestone achieved

Example:

- Reach 20 workouts → celebratory dinner
- Save $1,000 → book an excursion
- Finish trip planning → choose a shared reward

#### Goal completed

Example:

- Complete the Mexico plan → unlock the final celebration
- Reach the savings goal → schedule the trip experience

### 8.2 Consequence categories

#### Acts of service

- Cook dinner
- Do the dishes
- Handle laundry
- Clean a chosen room
- Make breakfast
- Take over a household responsibility
- Give the partner a free evening
- Handle an annoying errand

#### Affection and relationship

- Buy flowers
- Write a note
- Plan a date
- Give a massage
- Recreate the first date
- Organize a phone-free evening
- Plan a surprise

Keep templates playful and consensual. Avoid coercive sexual content, humiliation, danger, illegality, or public-shaming mechanics.

#### Treats and spending

- Buy coffee
- Pay for dinner
- Cover the next date
- Buy dessert
- Add money to a shared experience
- Purchase something from a wishlist

The app records the obligation but does not process or enforce the transaction.

#### Choice and privileges

- Winner chooses the movie
- Winner chooses the restaurant
- Winner controls the playlist
- Winner chooses the next activity
- Winner gets a guilt-free solo evening

#### Custom

Users can create any consensual custom consequence or reward.

### 8.3 Multiple consequences on one goal

A single goal may contain several consequence rules.

Example:

Goal: Work out four times per week

- Miss a scheduled day → cook dinner
- Miss the weekly target → buy flowers
- Lose the weekly partner competition → pay for Friday's date
- Complete 20 total workouts → choose a celebratory activity

Default behavior: all independently satisfied rules trigger.

The UI should warn users when one result can trigger several obligations.

### 8.4 Editing rules

Everything remains editable.

Rules:

- Editing a goal or rule immediately changes future calculations
- Existing obligations are independent records
- Editing a consequence rule does not silently rewrite an already-created obligation
- Users may directly edit, complete, forgive, or delete an obligation
- Those actions may appear in activity history
- There is no approval requirement

This preserves flexibility while preventing accidental historical corruption.

### 8.5 Obligation states

- Pending
- Scheduled
- Completed
- Forgiven
- Dismissed

Suggested obligation fields:

- Owed by
- Owed to
- Source goal
- Source rule
- Display title
- Description
- Trigger timestamp
- Optional due date
- State
- Completion timestamp
- Optional note

---

## 9. Couple Momentum

Couple Momentum is the primary sticky mechanic and shared emotional score.

### Purpose

- Translate many different goals into one understandable signal
- Make each partner's actions feel connected
- Encourage cooperation
- Create a reason to return without relying on punishment
- Provide a positive weekly narrative

### V1 calculation

For each active action:

1. Calculate progress divided by target for the current period
2. Cap the result at 100 percent for Momentum purposes
3. Exclude future scheduled occurrences
4. Convert each included action to a normalized completion percentage
5. Average included action percentages
6. Display the resulting couple percentage

Recommended weighting:

- Shared goals: count once at full weight
- Individual goals: each person's action counts separately
- Shared habits tracked separately: each partner's result counts separately
- Friendly competitions: do not add separate Momentum weight when they use actions already included
- Optional goals with contributes_to_momentum = false are excluded

Avoid complex weights in V1. Add weighting only if usage shows a genuine need.

### Momentum streak

A couple extends its streak when weekly Momentum meets a default threshold of 70 percent.

The threshold may become configurable later.

The app should never use hostile language when a streak ends. Prefer:

> Fresh week, fresh momentum.

Instead of:

> You broke your streak.

---

## 10. Weekly Showdown

The Weekly Showdown is the recurring couple ritual.

Order of presentation:

1. Shared result
2. Couple Momentum change
3. Shared goal progress
4. Milestones and celebrations
5. Individual consistency
6. Friendly competition results
7. Newly triggered consequences and rewards
8. Outstanding obligations
9. Set up or continue next week's goals

Example:

> Your week together  
> 18 actions completed  
> $275 saved for Mexico  
> Couple Momentum: 84%, up 12 points  
> Three milestones reached  
> Taylor won the workout challenge  
> Michael owes dinner and flowers

The recap should be generated from activity data. It can initially be computed on demand instead of persisted.

Potential celebratory elements:

- Brief confetti animation
- Animated Momentum ring
- Rotating playful copy
- A recap card suitable for saving or sharing
- A warm partner appreciation prompt

Do not create infinite feeds, random loot boxes, or attention-maximizing mechanics.

---

## 11. Healthy engagement model

### 11.1 Hook Model

Nir Eyal's Hook Model contains:

1. Trigger
2. Action
3. Variable reward
4. Investment

Reference: https://www.nirandfar.com/how-to-manufacture-desire/

Use it as an interaction loop, not as permission to maximize compulsive use.

### Couple Goals adaptation

#### Trigger

Useful external triggers:

- An action is due
- The partner logged progress
- A shared milestone is close
- Weekly Showdown is ready
- An obligation is scheduled
- The couple's trip or end date is approaching

Desired internal triggers over time:

- “I want us to stay on track.”
- “I want to contribute.”
- “I wonder how we're doing together.”
- “I want to celebrate this with my partner.”
- “I don't want to leave my partner carrying the goal alone.”

Avoid using anxiety, jealousy, public shame, or relationship insecurity as triggers.

#### Action

The smallest useful actions should take seconds:

- Tap to log completion
- Add an amount saved
- Mark a milestone complete
- React to partner progress
- Check Couple Momentum
- Mark an obligation fulfilled
- Choose next week's playful stake

Apply the Fogg Behavior Model: behavior occurs when motivation, ability, and a prompt converge. The app has motivated users, so the design should prioritize ability and well-timed prompts.

Reference: https://behaviordesign.stanford.edu/resources/fogg-behavior-model

#### Variable reward

Variation should come from meaningful relationship outcomes, not casino mechanics:

- A different celebration when the couple advances
- A partner reaction or encouraging note
- Revealing the Weekly Showdown
- Seeing which milestone unlocked
- Discovering which playful consequence became owed
- Rotating appreciation prompts
- Progress toward a real shared experience
- An unexpectedly strong week together

The strongest reward is not a badge. It is evidence that the couple is becoming the kind of team they want to be.

#### Investment

Each interaction should make the product more valuable to the couple:

- Defining a shared goal
- Adding milestones
- Choosing meaningful stakes
- Building a history
- Recording savings
- Creating shared rituals
- Completing obligations
- Learning which goals and consequences motivate them
- Accumulating a visual story of what they achieved together

Investment should increase relevance, not trap users through switching costs.

### 11.2 Self-Determination Theory guardrail

Self-Determination Theory highlights three psychological needs:

- Autonomy
- Competence
- Relatedness

Reference: https://selfdeterminationtheory.org/theory/

Couple Goals should support all three:

- **Autonomy:** Everything is consensual and editable; users control goals, stakes, and notifications.
- **Competence:** Progress, milestones, and Momentum show that effort is working.
- **Relatedness:** The couple experiences goals as shared identity and mutual support.

Relatedness is the primary advantage over ordinary habit trackers.

### 11.3 Product engagement formula

Use this combined model:

> Meaningful Trigger → Tiny Action → Relationship Reward → Shared Investment

With three health checks:

- Does the user retain autonomy?
- Does the interaction demonstrate competence?
- Does it strengthen relatedness?

This is better suited to Couple Goals than applying variable rewards mechanically.

### 11.4 Ethical standard

Use the regret test:

> If users understood exactly how this engagement mechanism worked, would they still choose it?

The product succeeds when couples accomplish meaningful goals and create positive offline interactions. Session time is not a primary success metric.

---

## 12. Navigation and screens

Recommended bottom navigation:

1. Today
2. Goals
3. Together
4. Owed
5. Profile

### 12.1 Onboarding

- Welcome and positioning
- Create account
- Create or join a couple
- Invite partner by link or short code
- Choose shared couple time zone
- Select a starter goal or create custom
- Optional Mexico-style starter flow
- Notification permission requested only after value is explained

### 12.2 Today

- Couple Momentum header
- Today's due actions
- Quick-log controls
- Partner activity preview
- Nearest shared milestone
- Outstanding scheduled obligation
- Friendly encouragement copy

### 12.3 Goals

- Active shared goals
- Personal goals
- Savings goals
- Friendly bets
- Completed and archived goals
- Create button with templates and custom option

### 12.4 Goal detail

- Goal title and shared purpose
- Progress visualization
- Partner contributions
- Actions
- Milestone timeline
- Consequence and reward rules
- Recent activity
- Edit controls
- Archive/delete controls

### 12.5 Together

- Couple Momentum
- Shared streak
- Current shared objectives
- Weekly Showdown
- Historical weekly summaries
- Milestones achieved
- Friendly score and highlights
- Relationship progress timeline

### 12.6 Owed

- You owe
- Partner owes
- Rewards unlocked
- Scheduled
- Completed history
- Actions: schedule, edit, complete, forgive, dismiss

### 12.7 Profile/settings

- Profile
- Partner connection
- Subscription
- Shared time zone
- Notification settings
- Data export later
- Disconnect partner
- Delete account
- Legal and privacy links

---

## 13. Visual and content direction

### Personality

- Playful
- Spicy
- Warm
- Supportive
- Adult
- Energetic
- Never saccharine or childish

### Suggested palette

- Warm cream background
- Raspberry or coral primary
- Deep plum text and dark surfaces
- Lime or teal celebration accent
- Muted peach secondary surface

Use accessible contrast ratios.

### UI traits

- Rounded, tactile cards
- Strong progress visualization
- Couple avatars shown together
- Smooth but restrained motion
- Confetti reserved for meaningful wins
- Clear typography
- Large thumb-friendly logging controls
- Lighthearted empty states
- No hearts on every screen

### Language

Favor:

- Together
- Momentum
- Build
- Celebrate
- Make it up
- Our goal
- Friendly bet
- Shared win
- You two
- This week together

Avoid:

- Punishment as the default label
- Failure-heavy messaging
- Surveillance language
- Partner policing
- Winners and losers dominating the experience
- Shame or guilt

“Consequence” can be used in setup. “Owed,” “make it up,” or the actual obligation should be used in the everyday UI.

---


## 13A. Locked UI reference direction

The approved product-design blend is:

> Strava familiarity + Duolingo cooperative loops + Finch warmth + Paired relationship ritual

The interface should feel familiar even when the palette and relationship mechanics feel new. Originality comes from the couple data, shared-goal visuals, writing, colors, rewards, and consequences—not novel navigation.

### Four-tab navigation

1. Today
2. Goals
3. Together
4. Owed

Settings live behind the profile/avatar control.

### Today hierarchy

1. Couple avatars, greeting, and nearest important end date
2. Large Couple Momentum hero card
3. Shared-goal progress cards
4. Fast one-tap personal actions
5. Partner Pulse with recent partner activity and lightweight reactions
6. Nearest milestone or scheduled obligation

### Signature Couple Momentum visual

Use two visually distinct partner progress paths that merge into a shared result:

- Raspberry for one partner
- Teal for the other partner
- Combined state for shared progress

This should become the most recognizable visual element in the product.

### Goal creation

Use familiar templates plus Custom:

- Build something together
- Save for something
- Shared habit
- Personal goal
- Friendly bet
- Milestone plan
- Custom

Present creation as:

1. The goal
2. The plan
3. Make it fun

### Goal detail hierarchy

1. Goal name, end date, and progress
2. Partner contributions
3. This week's actions
4. Milestones
5. Rewards and consequences
6. Recent activity
7. Historical periods

### Together hierarchy

1. Couple Momentum trend
2. Shared streak
3. Weekly Showdown
4. Shared-goal highlights
5. Milestones and celebrations
6. Monthly consistency history
7. Friendly competition results

### Owed hierarchy

Use two primary views:

- You owe
- Coming your way

Obligation cards support scheduling, editing, completion, forgiveness, and dismissal without approval workflows.

### Engagement mechanics approved for V1

1. Couple Momentum plus Partner Pulse
2. Weekly Showdown as the recurring couple ritual

Do not add global leaderboards, public feeds, multiple point currencies, XP levels, cartoon mascots, dense analytics, or constant winner/loser framing.

### Integration priority

If one external activity integration is added after the manual core loop, prioritize Strava before Apple Health. Keep manual logging first-class because shared goals also include savings, travel, dates, household projects, and relationship actions.

---

## 14. Monetization

Target price:

- $4.99 per couple per month
- Consider $39.99 per couple per year
- Consider a 14-day free trial

Charge one account for the couple. Do not require two separate $2.50 purchases.

Entitlement behavior:

- One member is subscription owner
- Active subscription unlocks premium for the connected couple
- If the couple disconnects, entitlement stays with the paying account
- Partner receives access while connected
- Restore purchases must be supported
- Initial internal testing should keep the paywall disabled

Use RevenueCat rather than building receipt validation and cross-platform subscription state manually.

Possible free-versus-premium split should be tested later. Do not prematurely cripple the core couple loop.

Potential initial premium positioning:

- Unlimited active goals
- Unlimited consequence rules
- Full history
- Advanced recap insights
- More themes and celebration styles
- Annual relationship recap

Do not charge separately for individual consequences or use a percentage of stakes.

---

## 15. Technical architecture

### Recommended stack

- Expo
- React Native
- TypeScript
- Expo Router
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Postgres Row-Level Security
- Supabase Edge Functions only where server execution is needed
- React Hook Form
- Zod
- date-fns
- React Native Reanimated
- Lucide React Native
- Expo Notifications
- RevenueCat
- Jest or Vitest for domain logic
- React Native Testing Library for key UI flows

### Architectural principles

- Keep domain logic separate from screens
- Make consequence evaluation and Momentum calculation pure functions where possible
- Store timestamps in UTC
- Store one IANA time-zone identifier on the couple
- Use soft deletion for goals referenced by history
- Use migrations for every schema change
- Never put service-role credentials in the mobile app
- Enforce couple privacy in Row-Level Security, not only in UI code
- Avoid a custom backend unless a server-only operation requires it
- Do not over-abstract the V1

### Suggested source structure

~~~
app/
  _layout.tsx
  (auth)/
    sign-in.tsx
    onboarding.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    goals.tsx
    together.tsx
    owed.tsx
    profile.tsx
  goals/
    new.tsx
    [goalId].tsx
    [goalId]/edit.tsx
  recap/
    [periodId].tsx

src/
  components/
  features/
    auth/
    couples/
    goals/
    check-ins/
    consequences/
    momentum/
    recap/
    subscriptions/
  domain/
    momentum.ts
    consequence-engine.ts
    recurrence.ts
    competition.ts
  hooks/
  lib/
    supabase.ts
    notifications.ts
    revenuecat.ts
  theme/
  types/
  utils/

supabase/
  migrations/
  seed.sql
  functions/

tests/
  domain/
  integration/
~~~

---

## 16. Proposed database model

### profiles

- id UUID, references auth user
- display_name
- avatar_url
- created_at
- updated_at

### couples

- id UUID
- display_name optional
- timezone
- invite_code
- invite_expires_at
- created_by
- created_at
- disconnected_at optional

### couple_members

- couple_id
- user_id
- role: subscriber_owner or member
- joined_at
- left_at optional
- unique active couple membership per user

### goals

- id
- couple_id
- created_by
- title
- description
- goal_type: shared_outcome, personal, shared_habit, savings, milestone, competition, custom
- owner_type: user, partner, shared, separate
- owner_user_id optional
- icon
- metric_type
- unit_label optional
- start_date
- end_date optional
- target_value optional
- contributes_to_momentum boolean
- status: draft, active, completed, archived
- created_at
- updated_at
- deleted_at optional

### actions

- id
- goal_id
- title
- description optional
- assigned_user_id optional
- metric_type
- unit_label optional
- cadence_type: once, daily, weekdays, weekly, monthly, total
- selected_weekdays optional integer array or JSON
- target_value
- start_date
- end_date optional
- contributes_to_momentum
- sort_order
- created_at
- updated_at
- deleted_at optional

### check_ins

- id
- couple_id
- goal_id
- action_id optional
- user_id
- value
- occurred_at
- note optional
- photo_path optional
- created_at
- updated_at
- deleted_at optional

### milestones

- id
- goal_id
- title
- description optional
- target_value optional
- due_at optional
- completed_at optional
- completed_by optional
- reward_text optional
- sort_order
- created_at
- updated_at

### competitions

- id
- couple_id
- goal_id optional
- title
- metric_type
- unit_label optional
- start_at
- end_at
- participant_one_user_id
- participant_two_user_id
- target_action_id optional
- comparison_type: highest_value, highest_percentage, first_to_target
- tie_rule_text optional
- result_user_id optional
- status
- created_at
- updated_at

### consequence_rules

- id
- couple_id
- goal_id optional
- action_id optional
- competition_id optional
- trigger_type: occurrence_miss, period_miss, competition_loss, milestone_complete, goal_complete
- trigger_config JSONB
- beneficiary_user_id optional
- responsible_user_id optional
- category
- title
- description optional
- stack_mode: stack or largest_wins
- active
- created_at
- updated_at

### obligations

- id
- couple_id
- source_rule_id optional
- source_goal_id optional
- owed_by_user_id optional
- owed_to_user_id optional
- obligation_type: consequence or reward
- category
- title
- description optional
- triggered_at
- due_at optional
- status: pending, scheduled, completed, forgiven, dismissed
- completed_at optional
- note optional
- created_at
- updated_at

### activity_events

- id
- couple_id
- actor_user_id
- event_type
- entity_type
- entity_id
- summary
- metadata JSONB
- occurred_at

### subscriptions

- id
- owner_user_id
- revenuecat_app_user_id
- entitlement
- status
- current_period_end optional
- platform optional
- updated_at

Consider whether subscription state should be cached locally or fetched from RevenueCat. Avoid treating a stale database row as the sole source of billing truth.

---

## 17. Row-Level Security requirements

Users may:

- Read their own profile
- Update their own profile
- Read the active couple in which they are a member
- Read and mutate records belonging to their active couple
- Read their couple's activity history
- Access storage objects scoped to their couple

Users may not:

- Read another couple's data
- Join more than one active couple
- Add arbitrary users to a couple without a valid invite
- Access another couple's storage paths
- Set themselves as paid through a client-side database mutation

Create SQL tests or documented manual checks for these policies.

---

## 18. Edge-case decisions

### Editing

- Everything is editable
- No partner approval
- Material edits create activity events
- Current progress may recalculate immediately
- Existing obligations are not silently rewritten by rule edits
- Obligations themselves can be edited or forgiven

### Deletion

- Goals with history are archived or soft-deleted
- Associated historical check-ins remain available
- Outstanding obligations remain unless separately dismissed
- Users can permanently delete a check-in
- Account deletion must remove or anonymize data as appropriate

### Partner disconnect

- One active partner only
- Disconnect stops shared access
- Personal history remains available to the original user where feasible
- Shared data handling can be refined after observing real usage
- Subscription stays with payer
- A new partner cannot see a previous couple's private history

### Pairing

- Invite is single use
- Invite expires
- Opening before authentication should resume after sign-in
- Wrong-account acceptance can be undone by disconnecting
- A member already in an active couple cannot join another

### Time

- Couple selects one shared IANA time zone
- All timestamps are stored in UTC
- Period calculations use the couple time zone
- Start and end dates are inclusive in the couple time zone

### Competitions

- Same metric for both partners
- Default tie outcome is no winner
- Results can be manually corrected
- Editing can recalculate the displayed winner
- Previously created obligations remain independent

### Consequence stacking

- Default is stack all matching rules
- Optional largest-wins mode
- Warn during setup when several rules may trigger from the same miss

### Offline and failures

- Optimistic check-in UI is acceptable
- Failed writes must visibly retry or revert
- Duplicate submissions should be safely handled
- Push notifications are not a source of truth
- Dashboard state always comes from persisted records

---

## 19. Notifications

Useful notification types:

- Action due soon
- End-of-day reminder
- Partner logged progress
- Shared milestone reached
- Couple Momentum crossed a positive threshold
- Weekly Showdown ready
- Friendly competition ended
- New obligation created
- Scheduled obligation due
- Shared end goal approaching

User controls:

- Master toggle
- Due reminders
- Partner activity
- Weekly recap
- Obligations
- Quiet hours

Do not notify on every small event by default. Notifications should help the couple act, celebrate, or reconnect.

---

## 20. Analytics and success metrics

### North-star candidate

Weekly active couples completing at least one shared or personal action each.

This measures mutual participation rather than one-sided account activity.

### Core activation event

A couple:

1. Pairs accounts
2. Creates an active goal
3. Adds at least one action
4. Logs progress from both partners within seven days

### Retention indicators

- Both partners active in week two
- Weekly Showdown viewed
- Couple Momentum updated across consecutive weeks
- Milestone completion
- Obligation created and later completed
- Second goal created
- Shared goal contribution from both partners

### Product-learning metrics

- Goal types created
- Custom versus template goal use
- Percentage of goals with consequences
- Percentage with rewards
- Competition adoption
- Consequence categories
- Obligations completed versus forgiven
- Average time to first partner contribution
- Notification opt-in and usefulness

Do not use raw session time as a success metric.

---

## 21. V1 non-goals

Do not build:

- Automated evidence verification
- Partner approval workflows
- Banking connections
- Automated cash stakes
- Peer-to-peer payouts
- Flower ordering
- Restaurant reservations
- Marketplace fulfillment
- Public profiles
- Social feeds
- Friend groups
- Multiple partners
- Messaging or chat
- AI coaching
- HealthKit, Google Health Connect, Strava, or wearable integrations
- Complex recurrence syntax
- Web admin dashboard
- Deep analytics
- Location tracking
- Surveillance features

These can be revisited only after the core couple loop demonstrates retention.

---

## 22. Implementation sequence

### Phase 1: foundation

- Create Expo TypeScript project
- Configure Expo Router
- Add theme tokens
- Configure Supabase client
- Add environment template
- Add formatting, linting, and tests
- Create initial migrations and seed data

### Phase 2: identity and pairing

- Authentication
- Profile creation
- Create couple
- Invite link/code
- Join couple
- Enforce one active partner
- Pairing and disconnect settings

### Phase 3: goal system

- Goal templates
- Custom goal builder
- Goal detail
- Actions and cadence
- Check-ins
- Savings contributions
- Milestones
- Editing and archiving

### Phase 4: stakes

- Consequence-rule builder
- Mixed rules
- Friendly competitions
- Trigger evaluation
- Owed ledger
- Complete, schedule, edit, forgive, dismiss

### Phase 5: shared engagement

- Couple Momentum
- Momentum streak
- Together dashboard
- Weekly Showdown
- Activity history
- Celebration animation

### Phase 6: launch readiness

- Notifications
- RevenueCat entitlement architecture
- Paywall disabled by feature flag
- Error handling
- Loading and empty states
- Accessibility
- Account deletion
- Privacy and legal placeholders
- EAS build configuration
- README setup instructions
- Tests and smoke checks

---

## 23. Required tests

### Domain tests

- Daily boolean completion
- Selected weekday completion
- Weekly count target
- Monthly currency target
- Total target
- Period boundary in couple time zone
- Per-occurrence consequence trigger
- Period-miss consequence trigger
- Multiple stacked consequences
- Largest-wins mode
- Competition winner
- Competition tie
- First-to-target result
- Editing a rule does not alter existing obligation
- Momentum normalization
- Momentum excludes future actions
- Momentum avoids double-counting competition metrics
- Momentum streak threshold

### Integration tests

- Create user and profile
- Create couple and invite partner
- Prevent third member
- Prevent second active couple
- Create and edit goal
- Log and edit check-in
- Create obligation
- Complete or forgive obligation
- Read Weekly Showdown
- Confirm cross-couple data isolation

### Manual smoke test

- Two real devices
- Two accounts
- Pair through invitation
- Mexico seed goal
- Log progress from both phones
- Confirm realtime or refreshed progress
- Trigger an obligation
- Complete the obligation
- Close a competition
- View Weekly Showdown

---

## 24. V1 acceptance criteria

The V1 is successful when two users can:

1. Sign in
2. Pair as one couple
3. Create any pinned goal type or a custom goal
4. Add actions with supported cadence and metrics
5. Log and edit progress without approval
6. Create multiple consequence or reward rules
7. Run a friendly competition
8. Automatically or manually produce an owed obligation
9. Complete, forgive, edit, or dismiss the obligation
10. View Couple Momentum
11. View a Weekly Showdown
12. Review historical goals, check-ins, wins, losses, milestones, and obligations
13. Receive useful reminders
14. Use the app without accessing another couple's data

---

## 25. Defaults Codex should use without asking

- One active couple per user
- Mobile-first
- iOS and Android from one Expo codebase
- Supabase Postgres
- Honor-system logging
- No approval workflow
- Optional notes and photos
- Shared couple time zone
- Stack matching consequences by default
- Tie means no competition winner
- Existing obligations survive source-rule edits
- $4.99 subscription covers the couple
- Paywall disabled during initial testing
- Warm cream, raspberry/coral, deep plum, and teal/lime accent palette
- Cooperative content hierarchy
- Friendly competitions secondary
- Mexico preparation seed data
- Simple code over premature abstraction

---

## 26. Instructions for the Codex coding workspace

Use this document as the canonical product specification.

Before editing:

1. Inspect the repository and all instruction files
2. Confirm the current branch and working tree
3. Create a short implementation plan
4. Identify any true blockers
5. Do not ask questions already answered here

Then:

1. Scaffold the Expo TypeScript app
2. Install only the dependencies needed for the current phase
3. Implement in vertical slices
4. Use migrations for Supabase
5. Add tests alongside domain logic
6. Run type checking, linting, and tests
7. Preserve a working app after each milestone
8. Commit coherent changes
9. Document required manual setup
10. Never commit secrets

If external credentials are unavailable:

- Add typed environment placeholders
- Provide exact setup steps
- Continue with local/demo implementations
- Do not block the rest of the build

If a package or API has changed:

- Check its current official documentation
- Use the current supported approach
- Record any material deviation from this brief in the README

---

## 27. Full Codex kickoff prompt

Copy this into the Codex coding workspace after opening the repository:

~~~
You are building Couple Goals in this repository.

First, read CODEX_BUILD_BRIEF.md completely. Treat it as the canonical product and technical specification. Inspect the repository and any AGENTS.md files before editing.

Build a mobile-first Expo/React Native TypeScript app for couples to create shared goals, personal contributions, shared habits, savings goals, milestones, friendly competitions, and fully custom goals.

Core rules:
- One active partner per user
- Cooperative progress first; competition is optional
- Honor-system logging
- No partner approval or verification workflow
- Goals, actions, check-ins, competitions, consequence rules, and obligations remain editable
- Mixed consequence rules are supported
- Existing obligations are independent from later rule edits
- No payment stakes, ordering, fulfillment, banking, chat, public feed, or AI coaching in V1
- Couple Momentum and Weekly Showdown are core features
- Subscription architecture targets $4.99 per couple monthly, billed to one account, but the paywall remains disabled for initial testing

Use:
- Expo
- React Native
- TypeScript
- Expo Router
- Supabase Postgres, Auth, Storage, and Row-Level Security
- React Hook Form
- Zod
- date-fns
- React Native Reanimated
- Lucide React Native
- Expo Notifications
- RevenueCat behind a feature flag
- Appropriate unit and integration testing

Design:
- Playful, spicy, polished, warm, and adult
- Warm cream, raspberry/coral, deep plum, and restrained teal/lime accents
- Relationship-building language
- Shared goals and progress visually dominate friendly competition
- Fast, thumb-friendly check-ins
- Meaningful, restrained celebrations

Required deliverables:
- Working Expo project
- Supabase SQL migrations and RLS policies
- Mexico preparation seed data
- Environment variable template
- Complete setup README
- Domain tests for recurrence, consequences, competitions, and Couple Momentum
- EAS configuration
- Clear list of remaining credential-dependent steps

Work autonomously from the defaults in the brief. Ask only when a decision is genuinely blocking and not covered by CODEX_BUILD_BRIEF.md.

Start by:
1. Reporting the repository state
2. Presenting a concise implementation plan
3. Scaffolding the project
4. Implementing the foundation and first vertical slice
5. Running all available checks
~~~

---

## 28. Final product test

The first meaningful real-world test is not whether the screens look finished.

It is whether the founding couple can use Couple Goals during Mexico preparation and naturally complete this loop:

> Define something meaningful together → take small actions → see shared progress → experience a celebration or playful consequence → invest in the next goal.

If that loop feels warm, motivating, and worth repeating, the product has earned further scope.
