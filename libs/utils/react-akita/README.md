# @mindspace-io/react-akita

![image](https://user-images.githubusercontent.com/210413/111729764-d4d45580-883d-11eb-8284-3f38f8963df2.png)

## Purpose

A small, super powerful statemanagement library for React; using an [Akita](https://github.com/datorama/akita) engine and [Zustand](github.com/pmndrs/zustand)-like API.

This library now provides super-powered Store `createStore()` function to simultaneously 

* Create a store with managed state, and 
* Create a React hook to query its associated store state.

> Please consult the [Zustand ReadMe](https://github.com/pmndrs/zustand/blob/master/readme.md) for details on additional usages.

<br/>

### Create a Store

The beauty of the `createStore()` is that a factory function is used to build the initial state. And the factory function is actually provided the `set`, `get`, `api` store api:

```ts
import create from '@mindspace-io/react-akita';

interface StoreState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

const onStoreReady = (set, get, api) => {
  return {
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
  };
};

const store = createStore<StoreState>(onStoreReady);
const useStore = store; // store is ALSO a React hook
```

The `store` is **BOTH** a React Hook and [store API](#using-the-store-api).

<br/>

### Using the React Hook

Then bind your components, and that's it!
Use the hook anywhere, no providers needed. Select your state and the component will re-render on changes.

```tsx
function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>one up</button>;
}
```

NOTE: you **cannot** use the hook multiple times in the same component:

```tsx
function BearCounter() {
  const bears = useStore((state) => state.bears);
  const increasePopulation = useStore((state) => state.increasePopulation);

  return <h1>{bears} around here ...</h1>;
}
```

This ^ will generate runtime errors. The solution is to combine the two (2) selectors into a single, composite selector:

```tsx
function BearCounter() {
  const [bears, increasePopulation] = useStore((state) => [state.bears, state.increasePopulation]);

  return <h1 onClick={increasePopulation}>{bears} around here ...</h1>;
}
```

<br/>

## Using the Store API

When a store is created it has the following functional API:

```ts
export interface StoreApi<T extends State> extends StatusAPI {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  destroy: Destroy;
}

const store: StoreAPI<StoreState> = createStore<StoreState>(onStoreReady);
```

Using the Store API allows developers to imperatively query/update state, subscribe for change notifications, or dispose of the store.

This can be very useful for scenarios where the API is used outside a Component; the React Hook may not be available.

<br/>

## Special Features

- The state is enhanced to include Status properties
- The Store API is enhanced to include Status API functions
- All state emitted (via selectors) is now immutable; using Immer internally

Often state management requires status tracking for loading activity and error conditions.

In addition to the Store API, the store is now auto enhanced with the following features:

```ts
export interface StatusAPI {
  setIsLoading: (isLoading = true) => void;
  setError: (error: unknown) => void;
}

export type Status = { isLoading: boolean; error: unknown };
```

<br/>

---

### Installation

Just install with:

```terminal
npm install @mindspace-io/react-akita
```

Under the hood, this library uses `immer`, `@datorama/akita`, and `@mindspace-io/react`; these will be automatically installed along with `@mindspace-io/react-akita`.
