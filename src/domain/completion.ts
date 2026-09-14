export type CompletionCheckIn = { localDate: string; value: number };
export function dailyCompletion(
  checkIns: CompletionCheckIn[],
  localDate: string,
): number {
  return Math.min(
    checkIns
      .filter((item) => item.localDate === localDate)
      .reduce((sum, item) => sum + Math.max(item.value, 0), 0),
    1,
  );
}
export function periodCompletion(
  checkIns: CompletionCheckIn[],
  startDate: string,
  endDate: string,
  target: number,
) {
  const progress = checkIns
    .filter((item) => item.localDate >= startDate && item.localDate <= endDate)
    .reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  return {
    progress,
    target,
    ratio: target > 0 ? Math.min(progress / target, 1) : 0,
    complete: target > 0 && progress >= target,
  };
}
