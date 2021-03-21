/**
 * State types (inspired/copied from Zustand)
 *
 * types inspired by setState from React, see:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/6c49e45842358ba59a508e13130791989911430d/types/react/v16/index.d.ts#L489-L495
 */
export type Status = Partial<{ isLoading: boolean; error: unknown }>;
export type CustomValue = string | number | symbol | object;
export type CustomState = Record<string | number | symbol, unknown>;
export type State = CustomState & Status;

export type SetLoading = (isLoading?: boolean) => void;
export type SetError = (error: unknown) => void;
export interface StatusAPI {
  setError: SetError;
  setIsLoading: SetLoading;
}

export type PartialState<T extends State, K extends keyof T = keyof T> =
  | (Pick<T, K> | T)
  | ((state: T) => Pick<T, K> | T);
export type StateSelector<T extends State, U> = (state: T) => U;
export type StateSelectorList<T extends State, U> = StateSelector<T, U>[];

export type EqualityChecker<T> = (state: T, newState: T) => boolean;

export type StateListener<T> = (state: T, previousState?: T) => void;
export type StateSliceListener<T> = (slice: T, previousSlice?: T) => void;

export type Unsubscribe = () => void;
export interface Subscribe<T extends State> {
  (listener: StateListener<T>): Unsubscribe;
  <StateSlice>(listener: StateSliceListener<StateSlice>, selector: StateSelector<T, StateSlice>): Unsubscribe;
}

export interface ComputedProperty<T extends State, K, U> {
  name: string;
  selectors: StateSelectorList<T, K>[];
  predicate: (values: K[]) => U;
}
// Add computed property to the store
export type AddComputedProperty<T extends State> = {
  <K, U extends unknown>(property: ComputedProperty<T, K, U>): void;
};

export type SetState<T extends State> = {
  <K extends keyof T>(partial: PartialState<T, K>, replace?: boolean): void;
};
export type GetState<T extends State> = () => T;
export type Destroy = () => void;
export interface StoreApi<T extends State> extends StatusAPI {
  setState: SetState<T>;
  getState: GetState<T>;
  addComputedProperty: AddComputedProperty<T>;
  subscribe: Subscribe<T>;
  destroy: Destroy;
}
export type StateCreator<T extends State, CustomSetState = SetState<T>> = (
  set: CustomSetState,
  get: GetState<T>,
  api: StoreApi<T>
) => T;

export type StateCreatorOptions = {
  storeName?: string; // Used by Akita to decorate the Store constructor
};

/**
 * Interface for the custom hook published from calls to `createStore()`
 */
export interface UseStore<T extends State> extends StatusAPI {
  (): T;
  <U>(selector: StateSelector<T, U> | StateSelectorList<T, U>): U;
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  addComputedProperty: AddComputedProperty<T>;
  destroy: Destroy;
}
