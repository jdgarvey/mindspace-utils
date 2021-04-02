import { StateSelectorList, State } from '@mindspace-io/react';

export interface MessagesState extends State {
  filterBy: string;
  messages: string[];
  updateFilter: (filterBy: string) => void;
  filteredMessages: string[];
}

export type MessagesVM = [string, string[], (v: string) => void];

export const selectMessageVM = <StateSelectorList<MessagesState, MessagesVM>>[
  (s: MessagesState) => s.filterBy,
  (s: MessagesState) => s.filteredMessages,
  (s: MessagesState) => s.updateFilter,
];
