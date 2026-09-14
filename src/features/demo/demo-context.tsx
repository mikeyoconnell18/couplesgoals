import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { calculateMomentum } from '@/domain/momentum';
import { DemoAction, mexicoActions } from './demo-data';

type DemoState = { actions: DemoAction[]; momentum: number; logAction: (id: string) => void; lastLogged?: string };
const Context = createContext<DemoState | null>(null);
export function DemoProvider({ children }: PropsWithChildren) {
  const [actions, setActions] = useState(mexicoActions);
  const [lastLogged, setLastLogged] = useState<string>();
  const momentum = useMemo(() => calculateMomentum(actions.map((a) => ({ id: a.id, progress: a.value, target: a.target, contributesToMomentum: true }))), [actions]);
  const logAction = (id: string) => { setActions((current) => current.map((a) => a.id === id ? { ...a, value: Math.min(a.value + 1, a.target), detail: `${Math.min(a.value + 1, a.target)} of ${a.target} this week` } : a)); setLastLogged(id); };
  return <Context.Provider value={{ actions, momentum, logAction, lastLogged }}>{children}</Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error('useDemo must be used inside DemoProvider'); return value; }
