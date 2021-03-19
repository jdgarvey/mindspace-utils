import React, { useCallback } from 'react';
import { createStore, State, StateSelector } from '@mindspace-io/react-akita';

import './app.css';

// ************************************
// Define the managed state and create a store
//
// createStore() returns a react hook
//   - called without a selector returns the entire state
//   - called with a selector returns state slice
//
// State managed in store using Akita and Immer
// Exposes immutable data, memoized selectors, and
// auto-adds 'error/isLoading/setLoading/setError' properties to the state
// ************************************

interface TestState extends State {
  count: number;
  incrementCount: () => void;
  decrementCount: () => void;
}

const useStore = createStore<TestState>((set) => ({
  messages: [],
  count: 0,
  incrementCount: () =>
    set((s) => {
      // Reducer-like: create and *return* new state
      return { ...s, count: s.count + 1 };
    }),
  decrementCount: () =>
    set((s) => {
      // This updater just modifies the draft directly... no reducer-like complexity
      //  feature supported as part of Akita + Immer
      s.count -= 1;
    }),
}));

// ************************************
// Main approach:
// Must employ `useCallback()`; since the selector is defined inside the render function.
// ************************************

const App: React.FC = () => {
  const [count, decrement, increment] = useStore(
    useCallback((s: TestState) => [s.count, s.decrementCount, s.incrementCount], [])
  );

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>You have clicked the magic button {count} times!</h2>
      <button onClick={increment}> Increment Count </button>
      <button onClick={decrement}> Decrement Count </button>
    </div>
  );
};

// ************************************
// Another approach:
// Does not employ `useCallback()`. Instead the selector is defined outside the render function.
// ************************************

type TestSelector = [number, () => void, () => void];
const selector: StateSelector<TestState, TestSelector> = (s: TestState) => [
  s.count,
  s.decrementCount,
  s.incrementCount,
];

const AppAlternate: React.FC = () => {
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
