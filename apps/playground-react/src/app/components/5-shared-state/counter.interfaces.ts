import { State } from "@mindspace-io/react";

export interface CounterState extends State {
  count: number;
  incrementCount: () => void;
}
