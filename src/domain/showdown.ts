export type ShowdownEntry = { userId: string; value: number };
export type ShowdownResult = {
  firstScore: number;
  secondScore: number;
  winnerId?: string;
  loserId?: string;
  tied: boolean;
  finalized: boolean;
};

export function calculateShowdown(
  firstUserId: string,
  secondUserId: string,
  entries: ShowdownEntry[],
  periodEnd: Date,
  now: Date,
): ShowdownResult {
  const score = (id: string) =>
    entries
      .filter((entry) => entry.userId === id)
      .reduce((sum, entry) => sum + Math.max(entry.value, 0), 0);
  const firstScore = score(firstUserId);
  const secondScore = score(secondUserId);
  const tied = firstScore === secondScore;
  const finalized = now > periodEnd;
  return {
    firstScore,
    secondScore,
    tied,
    finalized,
    winnerId:
      finalized && !tied
        ? firstScore > secondScore
          ? firstUserId
          : secondUserId
        : undefined,
    loserId:
      finalized && !tied
        ? firstScore < secondScore
          ? firstUserId
          : secondUserId
        : undefined,
  };
}
