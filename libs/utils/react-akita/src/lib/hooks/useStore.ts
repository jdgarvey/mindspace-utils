import { produce } from 'immer';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { useState, useEffect, useLayoutEffect } from 'react';
import { Query, Store, StoreConfigOptions, StoreConfig, UpdateStateCallback } from '@datorama/akita';

import { useObservable } from './useObservable';

import {
  Destroy,
  GetState,
  SetState,
  StoreAPI,
  ComputedProperty,
  AddComputedProperty,
  WatchProperty,
  State,
  StateCreator,
  StateCreatorOptions,
  StateSelector,
  StateListener,
  StateSliceListener,
  Unsubscribe,
  Subscribe,
  SetError,
  SetLoading,
  UseStore,
  StateSelectorList,
} from './store.interfaces';

/**
 * Akita expects a store decorator to be used to assign a name. If a name is not available,
 * a `console.error()` is thrown and inter-store messaging is not setup properly.
 * @see reinitStore() for the 'hack' fix
 */
@StoreConfig({ name: 'mindspace-io' })
class StoreWithConfig<T> extends Store<T> {}

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const identity = (s: any) => s as any;

/**
 * Create a store with specified state
 *
 * The store instances is actually a React hook with Store API added
 * All stores are decorated with Status state (isLoading, error, setIsLoading, and setError)
 *
 * @returns useStore: Hook that will emit either all state or partial state [based on passed selector].
 */
export function createStore<TState extends State>(
  createState: StateCreator<TState>,
  options: StateCreatorOptions = {}
): UseStore<TState> {
  /**
   * Internal, startup queue for computed and watched properties
   *
   * NOTE: is currently only used during store startup configuration
   */
  const computed: Record<string, () => void> = {};

  /**
   * Internal Akita Store + Query instances
   * Note: Immer immutability is auto-applied via the `producerFn` configuration
   */
  const name = options.storeName || `ReactAkitStore${Math.random()}`;
  const store = new StoreWithConfig<TState>({}, { producerFn: produce, name });
  const query = new Query<TState>(store);

  /**
   * setIsLoading() + setError()
   * Status API methods available on 'api'
   */
  const setIsLoading: SetLoading = (isLoading = true) => store.update((s) => ({ ...s, isLoading }));
  const setError: SetError = (error: Error | unknown) => {
    store.update((s) => ({ ...s, error }));
  };

  /**
   * setState() + getState()
   * Build API methods used that delegate to the store and query
   */
  const getState: GetState<TState> = store.getValue.bind(store);
  const setState: SetState<TState> = (partial, replace) => {
    const isCallback = partial instanceof Function;
    const updateWithValue: UpdateStateCallback<TState> = (s) => (replace ? s : { ...s, ...partial });
    store.update(!isCallback ? updateWithValue : (partial as UpdateStateCallback<TState>));
  };

  /**
   * subscribe()
   * The subscribe function allows components to bind to a state-portion without forcing re-render on changes
   */
  const subscribe: Subscribe<TState> = <StateSlice>(
    listener: StateListener<TState> | StateSliceListener<StateSlice>,
    selector?: StateSelector<TState, StateSlice>
  ): Unsubscribe => {
    const onNext = (s: TState & StateSlice) => listener(s);
    const watcher = query.select(selector || identity).subscribe(onNext);
    return () => watcher.unsubscribe();
  };

  /**
   * addComputedProperty()
   *
   * Inject the computed property into the target 'state':
   *
   * - Subscribe to state changes with the computed property selectors
   * - Use the computed property predicate function to map to a 'value' response
   * - update the targeted computed property with the 'value' response
   *
   * This method is used inside createStore() to configure watches during state
   * initialization.
   *
   * NOTE: since the store/query are not yet ready, we 'queue' these requests
   *       and later in `registerComputedProperties()` we finish the setup
   *       for all computed properties
   */
  const addComputedProperty: AddComputedProperty<TState> = <K extends any, U>(
    property: ComputedProperty<TState, K, U>,
    target?: TState
  ) => {
    const deferredSetup = () => {
      const makeQuery = (predicate) => query.select(predicate);
      const emitters: Observable<TState[any]>[] = property.selectors.map(makeQuery);
      const source$ = combineLatest(emitters).pipe(map(property.predicate));

      source$.subscribe((computedValue: unknown) => {
        callAsync((value) => {
          setState((s) => ({ ...s, ...{ [property.name]: value } }));
        }, computedValue);
      });
    };

    computed[property.name] = deferredSetup;
    return target;
  };

  /**
   * Watch for changes in a specific property and then notify 'listener'
   * This method is used inside createStore() to configure watches during state
   * initialization.
   */
  const watchProperty: WatchProperty<TState> = <StateSlice>(
    property: string,
    listener: StateSliceListener<StateSlice>
  ) => {
    const deferredSetup = () => {
      const onNext = (s: TState & StateSlice) => callAsync(listener, s);
      const selector = (s: TState) => s[property];
      const watcher = query.select(selector).subscribe(onNext);
      return () => watcher.unsubscribe();
    };

    computed[property] = deferredSetup;
  };

  /**
   * Activate all 'queued' computed/watched properties
   */
  const registerComputedProperties = () => {
    Object.keys(computed).map((propertyName) => {
      const registerNow = computed[propertyName];
      registerNow();

      delete computed[propertyName];
    });
  };

  /**
   * Complete streams and close the store
   */
  const destroy: Destroy = () => store.destroy();

  /**
   * Create the Store instance with desired API
   */
  const storeAPI: StoreAPI<TState> = {
    get: getState, // get immutable snapshot to state
    set: setState, // apply changes to state
    addComputedProperty: addComputedProperty, // compute property value from upstream changes
    watchProperty: watchProperty, // watch single property for changes
    observe: subscribe, // watch for changes WITHOUT trigger re-renders
    destroy: destroy, // clean-up store, disconnect streams
    setIsLoading, // easily set isLoading state
    setError, // easily set error state
  };

  /**
   * Internal utility methods for selectors
   *
   * toObservable(): Build an RxJS stream for the specified selector(s)
   * toStateSlice(): Gather current state values for the specified selector(s)
   */
  const toObservable = <StateSlice>(
    selector: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice> = identity
  ) => {
    const list = selector instanceof Array ? <StateSelectorList<TState, StateSlice>>selector : [selector];
    return list.length == 1 ? query.select(list[0]) : combineLatest(list.map((it) => query.select(it)));
  };
  const getSliceValueFor = <StateSlice>(
    selector: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice> = identity
  ): any | any[] => {
    const list = selector instanceof Array ? (selector as StateSelectorList<TState, StateSlice>) : null;
    const getCurrent = (it: StateSelector<TState, StateSlice>) => <any>it(getState());

    return list ? list.map(getCurrent) : getCurrent(selector as StateSelector<TState, StateSlice>);
  };

  /**
   * userStore()
   *
   * After the store has been created and initialized with api + state, this hoook
   * is created. Developer will use this custom react hook to 'select' state data.
   * The selected data sourcds will re-emit data after changes.
   *
   * This hook is implicitly connected to its associated [parent] store
   *
   * Warning!!
   *   1) Do not use same 'useStore' hook multiple times in the same component.
   *   2) To extract multiple slices, use
   *      a) a single selector to return a reponse (value, hashmap, or tuple)
   *      b) an array of selectors [optimized approach] to return response
   */
  const useStore: any = <StateSlice>(
    selector?: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice>
  ) => {
    const [initial] = useState<StateSlice>(() => getSliceValueFor(selector));
    const [slice, setSlice$] = useObservable<unknown>(null, initial);

    useIsoLayoutEffect(() => {
      setSlice$(toObservable(selector));

      return () => destroy();
    }, [selector]);

    return slice;
  };

  /**
   * Initialization of state management
   * Create the immutable state using the 'createState()' callback factory
   *
   * - Reinitialize the internal store,
   * - Register computed and watched properties
   * - inject storeAPI
   */
  const onInit = () => {
    const state = produce({}, () => ({
      ...{ error: null, isLoading: false },
      ...createState(storeAPI),
    }));

    reinitStore(store, name, state);
    registerComputedProperties();

    // Decorate hook function with API methods, public custom hook/store
    return Object.assign(useStore, storeAPI);
  };

  return onInit();
}

// *******************************************************
// Hacks
// *******************************************************

/**
 * Currently Akita expects a store class to be decorated with @StoreConfi() to set a store name
 * If this is not done, the constructor will assert a `console.error()`
 * @param store
 * @param name
 */
function reinitStore(store: Store, name: string, state) {
  if (!!name && store.storeName != name) {
    store.constructor['akitaConfig'].storeName = name;
    (store['options'] as StoreConfigOptions & {
      storeName: string;
    }).storeName = name;
  }
  // Reinitalize
  store['onInit'](state);
}

/**
 * Invoke the callback at the end of the microTask
 */
function callAsync(callback: (value: unknown) => void, resolveWith: unknown) {
  Promise.resolve(resolveWith).then(callback);
}
