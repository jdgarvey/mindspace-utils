import { createStore, StateSelector } from '@mindspace-io/react';
import { CounterState } from './counter.interfaces';

export type ViewModel = StateSelector<CounterState, [number, () => void, () => void]>;

export const useCounter = createStore<CounterState>(({ set }) => ({
  count: 0,
  messages: [],
  incrementCount() {
    set((d) => {
      d.count += 1;
    });
  },
}));
