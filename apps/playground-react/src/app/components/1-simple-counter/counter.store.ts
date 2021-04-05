import { createStore } from '@mindspace-io/react';
import type { CounterState } from './counter.interfaces';

/**********************************************
 *  Purpose:
 *
 *  Demonstrate the use of simple state management
 *
 **********************************************/

export const useCounter = createStore<CounterState>(
  ({ set }) => ({
    count: 0,
    incrementCount() {
      set((s) => {
        s.count += 1;
      });
    },
    decrementCount() {
      // uses Immer to support deep mutations
      set((s) => {
        s.count -= 1;
      });
    },
  }),
  { autoReset: true }
);

export type { CounterState };
