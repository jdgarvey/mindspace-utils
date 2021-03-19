import React, { useCallback } from 'react';
import { createStore, State, StateSelector } from '@mindspace-io/react-akita';

import './app.css';

interface TestState extends State {
  count: number;
  incrementCount: () => void;
  decrementCount: () => void;
}
type TestSelector = [number, () => void, () => void];
const useStore = createStore<TestState>((set) => ({
  count: 0,
  incrementCount: () => set((s) => ({ ...s, count: s.count + 1 })),
  decrementCount: () =>
    set((s) => {
      s.count -= 1;
    }),
}));

const NOOP = () => {};

const App: React.FC = () => {
  const selector: StateSelector<TestState, TestSelector> = useCallback(
    (s: TestState) => [s.count, s.decrementCount, s.incrementCount],
    []
  );
  const [count, decrement, increment] = useStore(selector);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>You have clicked the magic button {count} times!</h2>
      <button onClick={increment}> Increment Count </button>
      <button onClick={decrement}> Decrement Count </button>
    </div>
  );
};

export default App;
