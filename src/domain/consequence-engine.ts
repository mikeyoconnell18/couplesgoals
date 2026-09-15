export type ClosedPeriod = {
  key: string;
  endedAt: Date;
  progress: number;
  target: number;
  responsibleUserId: string;
  beneficiaryUserId?: string;
};
export type ConsequenceRule = {
  id: string;
  goalId: string;
  title: string;
  category: string;
  trigger: 'period_miss' | 'manual';
  active: boolean;
};
export type ObligationDraft = {
  dedupeKey: string;
  sourceRuleId: string;
  sourceGoalId: string;
  title: string;
  category: string;
  owedByUserId: string;
  owedToUserId?: string;
  triggeredAt: Date;
};

export function reconcileConsequences(
  rules: ConsequenceRule[],
  periods: ClosedPeriod[],
  existingKeys: ReadonlySet<string>,
  now: Date,
): ObligationDraft[] {
  const created = new Set(existingKeys);
  const drafts: ObligationDraft[] = [];
  for (const rule of rules) {
    if (!rule.active || rule.trigger !== 'period_miss') continue;
    for (const period of periods) {
      if (period.endedAt >= now || period.progress >= period.target) continue;
      const dedupeKey = `${rule.id}:${period.key}`;
      if (created.has(dedupeKey)) continue;
      created.add(dedupeKey);
      drafts.push({
        dedupeKey,
        sourceRuleId: rule.id,
        sourceGoalId: rule.goalId,
        title: rule.title,
        category: rule.category,
        owedByUserId: period.responsibleUserId,
        owedToUserId: period.beneficiaryUserId,
        triggeredAt: period.endedAt,
      });
    }
  }
  return drafts;
}
