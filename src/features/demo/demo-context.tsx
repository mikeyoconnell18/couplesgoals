import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { calculateMomentum } from '@/domain/momentum';
import {
  DemoActivity,
  demoActivity,
  DemoAction,
  mexicoActions,
} from './demo-data';
type DemoState = {
  actions: DemoAction[];
  momentum: number;
  activities: DemoActivity[];
  unread: number;
  lastLogged?: string;
  logAction: (id: string, value?: number) => void;
  undo: () => void;
  postNote: (body: string) => void;
  react: (id: string, reaction: string) => void;
  markNotificationsRead: () => void;
  resetDemo: () => void;
};
const Context = createContext<DemoState | null>(null);
export function DemoProvider({ children }: PropsWithChildren) {
  const [actions, setActions] = useState(mexicoActions);
  const [activities, setActivities] = useState(demoActivity);
  const [unread, setUnread] = useState(3);
  const [last, setLast] = useState<{ id: string; previous: number }>();
  const momentum = useMemo(
    () =>
      calculateMomentum(
        actions.map((a) => ({
          id: a.id,
          progress: a.value,
          target: a.target,
          contributesToMomentum: true,
        })),
      ),
    [actions],
  );
  function logAction(id: string, value = 1) {
    setActions((current) =>
      current.map((a) => {
        if (a.id !== id) return a;
        setLast({ id, previous: a.value });
        const next =
          a.metric === 'currency'
            ? Math.min(a.value + value, a.target)
            : Math.min(a.value + value, a.target);
        return {
          ...a,
          value: next,
          detail:
            a.metric === 'currency'
              ? `$${next.toLocaleString()} of $${a.target.toLocaleString()}`
              : `${next} of ${a.target} this week`,
        };
      }),
    );
  }
  function undo() {
    if (!last) return;
    setActions((current) =>
      current.map((a) =>
        a.id === last.id ? { ...a, value: last.previous } : a,
      ),
    );
    setLast(undefined);
  }
  function postNote(body: string) {
    setActivities((current) => [
      {
        id: `local-${Date.now()}`,
        author: 'You',
        title: 'Left some encouragement',
        body,
        time: 'Now',
      },
      ...current,
    ]);
  }
  function react(id: string, reaction: string) {
    setActivities((current) =>
      current.map((item) =>
        item.id === id ? { ...item, reaction: `${reaction} 1` } : item,
      ),
    );
  }
  function resetDemo() {
    setActions(mexicoActions);
    setActivities(demoActivity);
    setUnread(3);
    setLast(undefined);
  }
  return (
    <Context.Provider
      value={{
        actions,
        momentum,
        activities,
        unread,
        lastLogged: last?.id,
        logAction,
        undo,
        postNote,
        react,
        markNotificationsRead: () => setUnread(0),
        resetDemo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
