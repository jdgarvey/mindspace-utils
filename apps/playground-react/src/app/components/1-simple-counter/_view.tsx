import React, { useCallback } from 'react';

import { CodeBox } from '../_ui/code-box';

import { CounterState, CounterVM } from './counter.interfaces';
import { useCounter as useCounterStore } from './counter.store';

// ************************************
//  (1) Main approach:
//
// ************************************

export const SimpleCounter: React.FC = () => {
  const { count, incrementCount, decrementCount } = useCounterStore<CounterState>();

  return (
    <div className="sampleBox min-h-screen ">
      <section className="flex items-start justify-start px-4 bg-white">
        <div className="max-w-xl w-full rounded-lg shadow-lg p-4 flex flex-wrap">
          <div className="max-w flex-2">
            <h3 className="font-semibold text-lg tracking-wide">
              Total Votes <span className={`${count < 5 ? 'bg-red-200' : 'bg-green-300'} p-1`}>{count}</span>
            </h3>
            <p className="text-gray-500 my-1">
              Before you can work remote, you need a minimum of <span className="bg-gray-100 p-1">5</span> 'yes' votes.
            </p>
          </div>

          <div className="mt-3 flex items-end">
            <button
              onClick={incrementCount}
              className="bg-blue-500 text-white font-bold px-4 py-2 mr-4 text-sm uppercase rounded tracking-wider focus:outline-none hover:bg-blue-600"
            >
              ▲ Vote Yes
            </button>
            <button
              onClick={decrementCount}
              className="bg-red-400 text-white font-bold px-4 py-2 text-sm uppercase rounded tracking-wider focus:outline-none hover:bg-red-600"
            >
              ▼ Vote No
            </button>
          </div>
        </div>
      </section>

      <div className="max-w px-4 mt-12">
        <p className="font-normal text-md my-1 pb-8 pl-4">
          This reactive store is deliberately simple... to show how state (aka data) and
          <br />
          mutators (aka setter functions) can be easily constructed and used.
        </p>
        <CodeBox
          fileName="simple-counter.store.ts"
          src="https://carbon.now.sh/embed?bg=rgba%28249%2C250%2C251%2C0%29&t=one-dark&wt=none&l=application%2Ftypescript&ds=true&dsyoff=6px&dsblur=8px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=13.5px&lh=133%25&si=false&es=2x&wm=false&code=import%2520%257B%2520createStore%2520%257D%2520from%2520%27%2540mindspace-io%252Freact%27%253B%250Aimport%2520type%2520%257B%2520CounterState%2520%257D%2520from%2520%27.%252Fcounter.interfaces%27%253B%250A%250Aexport%2520const%2520useCounter%2520%253D%2520createStore%253CCounterState%253E%28%28%257B%2520set%2520%257D%29%2520%253D%253E%2520%28%257B%250A%2520%2520count%253A%25200%252C%250A%2520%2520incrementCount%28%29%2520%257B%250A%2520%2520%2520%2520set%28%28s%29%2520%253D%253E%2520%257B%2520%2520s.count%2520%252B%253D%25201%253B%2520%257D%29%253B%250A%2520%2520%257D%252C%250A%2520%2520decrementCount%28%29%2520%257B%250A%2520%2520%2520%2520set%28%28s%29%2520%253D%253E%2520%257B%2520%2520s.count%2520-%253D%25201%253B%2520%257D%29%253B%250A%2520%2520%257D%252C%250A%257D%29%29%253B"
        />
      </div>
    </div>
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
  const selector: CounterVM = useCallback((s: CounterState) => {
    return [s.count, s.decrementCount, s.incrementCount];
  }, []);
  const [count, decrement, increment] = useCounterStore(selector);

  return null;
};
