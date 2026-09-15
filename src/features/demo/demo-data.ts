import { colors } from '@/theme/tokens';
export type DemoAction = {
  id: string;
  title: string;
  detail: string;
  target: number;
  value: number;
  accent: string;
  metric: 'boolean' | 'count' | 'currency';
  assignee: string;
  unit?: string;
};
export type DemoActivity = {
  id: string;
  author: string;
  title: string;
  body: string;
  time: string;
  reaction?: string;
  comment?: string;
};
export const mexicoActions: DemoAction[] = [
  {
    id: 'workouts',
    title: 'Workout together',
    detail: '3 of 4 this week',
    target: 4,
    value: 3,
    accent: colors.raspberry,
    metric: 'boolean',
    assignee: 'Both',
  },
  {
    id: 'savings',
    title: 'Mexico spending fund',
    detail: '$900 of $3,000',
    target: 3000,
    value: 900,
    accent: colors.primary,
    metric: 'currency',
    assignee: 'Both',
    unit: '$',
  },
  {
    id: 'spanish',
    title: 'Practice Spanish',
    detail: '2 of 3 this week',
    target: 3,
    value: 2,
    accent: colors.coral,
    metric: 'count',
    assignee: 'Taylor',
    unit: 'sessions',
  },
];
export const demoActivity: DemoActivity[] = [
  {
    id: 'a1',
    author: 'Michael',
    title: 'Added $100 to Mexico savings',
    body: 'That excursion is getting closer.',
    time: '18 min',
    reaction: '🎉 1',
    comment: 'Taylor: We are doing this!',
  },
  {
    id: 'a2',
    author: 'Taylor',
    title: 'Completed Practice Spanish',
    body: 'Shared progress moved up.',
    time: 'Yesterday',
    reaction: '🔥 1',
  },
  {
    id: 'a3',
    author: 'Michael',
    title: 'Left some encouragement',
    body: 'Proud of the work we are putting in together.',
    time: 'Yesterday',
    reaction: '❤️ 1',
    comment: 'Taylor: Needed this today.',
  },
];
