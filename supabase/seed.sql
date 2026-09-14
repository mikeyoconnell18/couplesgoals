-- Run after creating and pairing two development users. Replace these values in a local-only copy.
-- This function seeds the founding Mexico scenario for an existing couple without committing identities.
create or replace function public.seed_mexico_demo(target_couple uuid, actor uuid) returns uuid language plpgsql as $$
declare mexico_goal uuid;
begin
  insert into public.goals(couple_id, created_by, title, description, goal_type, owner_type, icon, metric_type, start_date, end_date, target_value, status)
  values(target_couple, actor, 'Get ready for Mexico', 'Build fitness, savings, and trip plans together.', 'shared_outcome', 'shared', '🌴', 'percentage', current_date, current_date + 90, 100, 'active') returning id into mexico_goal;
  insert into public.actions(goal_id, title, metric_type, cadence_type, target_value, start_date, sort_order) values
    (mexico_goal, 'Work out together', 'count', 'weekly', 4, current_date, 1),
    (mexico_goal, 'Mexico spending fund', 'currency', 'total', 3000, current_date, 2),
    (mexico_goal, 'Practice Spanish', 'count', 'weekly', 3, current_date, 3);
  insert into public.milestones(goal_id, title, reward_text, sort_order) values (mexico_goal, 'Book the hotel', 'Celebrate with tacos', 1), (mexico_goal, 'Save the first $1,000', 'Choose an excursion', 2);
  return mexico_goal;
end $$;
