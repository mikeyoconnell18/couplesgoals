export type MetricType =
  'boolean' | 'count' | 'currency' | 'duration' | 'custom';
export type ParticipationMode = 'individual' | 'joint' | 'parallel';

export type ProgressCommitment = {
  id: string;
  metric: MetricType;
  target: number;
  participation: ParticipationMode;
  assignedUserId?: string | null;
  participantUserIds?: string[];
  cumulative?: boolean;
};

export type ProgressLog = {
  actionId: string;
  userId: string;
  value: number;
  localDate: string;
};

export type ProgressSeries = {
  personal: Record<string, number[]>;
  joint: number[];
};

/** Converts unlike units into one bounded share of an action's target. */
export function normalizeProgress(
  metric: MetricType,
  logged: number,
  target: number,
) {
  if (target <= 0) return 0;
  const progress =
    metric === 'boolean'
      ? Math.min(Math.max(logged, 0), target)
      : Math.max(logged, 0);
  return Math.min(progress / target, 1);
}

function mean(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

/**
 * Builds cumulative daily percentages. Joint work appears once; parallel work is
 * independently attributed to each participant. All aggregation happens after
 * unit normalization, so dollars and minutes are never compared directly.
 */
export function buildProgressSeries(
  commitments: ProgressCommitment[],
  logs: ProgressLog[],
  dates: string[],
  memberIds: string[],
): ProgressSeries {
  const personal = Object.fromEntries(
    memberIds.map((id) => [id, [] as number[]]),
  );
  const joint: number[] = [];
  const periodStart = dates[0];
  for (const date of dates) {
    const personalValues: Record<string, number[]> = Object.fromEntries(
      memberIds.map((id) => [id, []]),
    );
    const jointValues: number[] = [];
    for (const action of commitments) {
      const throughDate = logs.filter(
        (log) =>
          log.actionId === action.id &&
          (action.cumulative || !periodStart || log.localDate >= periodStart) &&
          log.localDate <= date,
      );
      if (action.participation === 'joint') {
        jointValues.push(
          normalizeProgress(
            action.metric,
            throughDate.reduce((sum, log) => sum + log.value, 0),
            action.target,
          ),
        );
      } else {
        const participants =
          action.participation === 'parallel'
            ? action.participantUserIds?.length
              ? action.participantUserIds
              : memberIds
            : [action.assignedUserId].filter((id): id is string => Boolean(id));
        for (const userId of participants) {
          if (!personalValues[userId]) continue;
          personalValues[userId].push(
            normalizeProgress(
              action.metric,
              throughDate
                .filter((log) => log.userId === userId)
                .reduce((sum, log) => sum + log.value, 0),
              action.target,
            ),
          );
        }
      }
    }
    for (const id of memberIds)
      personal[id].push(Math.round(mean(personalValues[id]) * 100));
    joint.push(Math.round(mean(jointValues) * 100));
  }
  return { personal, joint };
}

export function paceForDay(dayIndex: number, dayCount = 7) {
  if (dayCount <= 0) return 0;
  return Math.round(Math.min(Math.max((dayIndex + 1) / dayCount, 0), 1) * 100);
}

export function applicablePeriodTarget(
  cadence: string,
  target: number,
  dates: string[],
  selectedWeekdays: number[] = [],
) {
  if (cadence === 'daily') return target * dates.length;
  if (cadence === 'weekdays') {
    const occurrences = dates.filter((date) =>
      selectedWeekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()),
    ).length;
    return target * occurrences;
  }
  return target;
}

export function weekDates(now = new Date(), timeZone = 'UTC') {
  const localDate = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const start = new Date(`${localDate}T12:00:00Z`);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}
