export type Cadence = 'once' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'total';
export type RecurringAction = { cadence: Cadence; selectedWeekdays?: number[]; startDate: string; endDate?: string };

const dateKey = (date: Date, timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export function isActionDue(action: RecurringAction, instant: Date, timeZone: string): boolean {
  const today = dateKey(instant, timeZone);
  if (today < action.startDate || (action.endDate && today > action.endDate)) return false;
  if (action.cadence === 'weekdays') {
    const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(instant));
    return action.selectedWeekdays?.includes(index) ?? false;
  }
  return true;
}
