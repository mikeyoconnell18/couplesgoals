export type MomentumAction = {
  id: string;
  progress: number;
  target: number;
  contributesToMomentum: boolean;
  occursInFuture?: boolean;
  competitionSourceActionId?: string;
  participationMode?: 'individual' | 'joint' | 'parallel';
  participantUserId?: string;
};

export function calculateMomentum(actions: MomentumAction[]): number {
  const seen = new Set<string>();
  const included = actions.filter((action) => {
    if (
      !action.contributesToMomentum ||
      action.occursInFuture ||
      action.target <= 0
    )
      return false;
    const source = action.competitionSourceActionId ?? action.id;
    const identity =
      action.participationMode === 'parallel'
        ? `${source}:${action.participantUserId ?? 'unassigned'}`
        : source;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
  if (!included.length) return 0;
  const total = included.reduce(
    (sum, action) =>
      sum + Math.min(Math.max(action.progress / action.target, 0), 1),
    0,
  );
  return Math.round((total / included.length) * 100);
}

export function explainMomentumChange(
  change: number,
  contributions: {
    personName?: string;
    actionTitle: string;
    shared: boolean;
  }[],
) {
  if (!contributions.length)
    return 'Your first shared check-in will start Couple Momentum.';
  const lead = contributions[0];
  const subject = lead.shared ? 'You two' : (lead.personName ?? 'Your partner');
  const direction =
    change > 0
      ? `Up ${change}`
      : change < 0
        ? `Down ${Math.abs(change)}`
        : 'Steady';
  return `${direction} this week — ${subject} completed ${lead.actionTitle}.`;
}

export function extendsMomentumStreak(momentum: number, threshold = 70) {
  return momentum >= threshold;
}
