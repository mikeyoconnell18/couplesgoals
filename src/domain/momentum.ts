export type MomentumAction = { id: string; progress: number; target: number; contributesToMomentum: boolean; occursInFuture?: boolean; competitionSourceActionId?: string };

export function calculateMomentum(actions: MomentumAction[]): number {
  const seen = new Set<string>();
  const included = actions.filter((action) => {
    if (!action.contributesToMomentum || action.occursInFuture || action.target <= 0) return false;
    const identity = action.competitionSourceActionId ?? action.id;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
  if (!included.length) return 0;
  const total = included.reduce((sum, action) => sum + Math.min(Math.max(action.progress / action.target, 0), 1), 0);
  return Math.round((total / included.length) * 100);
}

export function extendsMomentumStreak(momentum: number, threshold = 70) { return momentum >= threshold; }
