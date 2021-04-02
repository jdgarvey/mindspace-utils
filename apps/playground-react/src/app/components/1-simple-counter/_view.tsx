import React, { useCallback } from 'react';

import { CounterState, CounterVM } from './counter.interfaces';
import { useCounter as useCounterStore } from './counter.store';
import { useCounter as useCounterHook } from './counter.hook';

// ************************************
//  (1) Main approach:
//
// ************************************

export const SimpleCounter: React.FC = () => {
  const { count, incrementCount, decrementCount } = useCounterStore<CounterState>();

  return <SimpleCounterContent count={count} onDecrement={decrementCount} onIncrement={incrementCount} />;
};

// ************************************
//  (2) Alternate approach:
//
//  Since the selector is defined inside the render function,
//  we must employ `useCallback()` !!
//
//  Note: We could define the selector outside the render function and then
//        the `useCallback()` would not be needed.
// ************************************

export const SimpleCounterAlternate: React.FC = () => {
  const selector: CounterVM = useCallback((s: CounterState) => {
    return [s.count, s.decrementCount, s.incrementCount];
  }, []);
  const [count, decrement, increment] = useCounterStore(selector);

  return <SimpleCounterContent count={count} onDecrement={decrement} onIncrement={increment} />;
};

export type ContentProps = {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const SimpleCounterContent: React.FC<ContentProps> = ({ count, onIncrement, onDecrement }) => {
  return (
    <div className="sampleBox">
      <p>
        You have clicked the ▲ button <span className="count">{count}</span> times!
      </p>

      <button onClick={onIncrement}> ▲ </button>
      <button onClick={onDecrement}> ▼ </button>
    </div>
  );
};
