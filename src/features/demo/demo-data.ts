export type DemoAction = {
  id: string;
  title: string;
  detail: string;
  target: number;
  value: number;
  accent: string;
};
export const mexicoActions: DemoAction[] = [
  {
    id: 'workouts',
    title: 'Workout together',
    detail: '3 of 4 this week',
    target: 4,
    value: 3,
    accent: '#D93F6A',
  },
  {
    id: 'savings',
    title: 'Mexico spending fund',
    detail: '$900 of $3,000',
    target: 3000,
    value: 900,
    accent: '#168C82',
  },
  {
    id: 'spanish',
    title: 'Practice Spanish',
    detail: '2 of 3 this week',
    target: 3,
    value: 2,
    accent: '#F26B5B',
  },
];
