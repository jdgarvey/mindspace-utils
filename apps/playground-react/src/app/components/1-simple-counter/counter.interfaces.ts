import { State, StateSelector } from '@mindspace-io/react';

/*******************************************
 * Define the view model + a selector function to extract ViewModel
 *******************************************/

export type CounterVM = StateSelector<CounterState, [number, () => void, () => void]>;

export const selectVM: CounterVM = (s: CounterState) => {
  return [s.count, s.decrementCount, s.incrementCount];
};

export interface CounterState extends State {
  count: number;
  incrementCount: () => void;
  decrementCount: () => void;
}
