import React, { useCallback } from 'react';

import { ViewModel, CounterState, useStore } from './simple-counter.store';

// ************************************
//  (1) Main approach:
//
// ************************************

export const SimpleCounter: React.FC = () => {
  const {visits, incrementCount, decrementCount} = useStore<CounterState>();

  return (
    <SimpleCounterContent 
      visits={visits} 
      onDecrement={decrementCount} 
      onIncrement={incrementCount} 
    />
  );
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
  const selector: ViewModel = useCallback((s: CounterState) => {
    return [s.visits, s.decrementCount, s.incrementCount];
  }, []);
  const [visits, decrement, increment] = useStore(selector);

  return (
      <SimpleCounterContent 
        visits={visits} 
        onDecrement={decrement} 
        onIncrement={increment} 
      />
  );
};



export type ContentProps = {
  visits: number;
  isLoading?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};


export const SimpleCounterContent: React.FC<ContentProps> = ({ visits, onIncrement, onDecrement }) => {
  return (
    <div className="magicbox">
      
        <p>
          You have clicked the ▲ button <span className="count">{visits}</span> times!
        </p>

        <button onClick={onIncrement}> ▲ </button>
        <button onClick={onDecrement}> ▼ </button>

    </div>
  );
};