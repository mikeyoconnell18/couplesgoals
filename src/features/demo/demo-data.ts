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
  participation: 'individual' | 'joint' | 'parallel';
  participantProgress?: Record<'Michael' | 'Taylor', number>;
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
    assignee: 'Each separately',
    participation: 'parallel',
    participantProgress: { Michael: 3, Taylor: 2 },
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
    participation: 'joint',
    unit: '$',
  },
  {
    id: 'spanish',
    title: 'Practice Spanish daily',
    detail: '2 of 3 this week',
    target: 3,
    value: 2,
    accent: colors.coral,
    metric: 'count',
    assignee: 'Michael',
    participation: 'individual',
    unit: 'sessions',
  },
  {
    id: 'nutrition',
    title: 'Prep a healthy lunch',
    detail: 'Completed today',
    target: 5,
    value: 4,
    accent: colors.raspberry,
    metric: 'boolean',
    assignee: 'Taylor',
    participation: 'individual',
  },
  {
    id: 'planning',
    title: 'Trip-planning session',
    detail: 'One shared session this week',
    target: 1,
    value: 0,
    accent: colors.primary,
    metric: 'boolean',
    assignee: 'Michael + Taylor together',
    participation: 'joint',
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
    title: 'Michael practiced Spanish',
    body: 'Shared progress moved up.',
    time: 'Yesterday',
    reaction: '🔥 1',
  },
  {
    id: 'a4',
    author: 'Taylor',
    title: 'Taylor prepped a healthy lunch',
    body: 'Michael sent support: “Proud of you.”',
    time: 'Today',
    reaction: '🙌 1',
  },
  {
    id: 'a5',
    author: 'Together',
    title: 'You two chose the hotel shortlist',
    body: 'One shared decision closer to Mexico.',
    time: 'This week',
    reaction: '❤️ 2',
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
