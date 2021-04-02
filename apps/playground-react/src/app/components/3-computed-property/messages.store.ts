import { createStore } from '@mindspace-io/react';

import { MESSAGES } from './messages.utils';
import { MessagesState } from './messages.interfaces';
import { onlyFilteredMessages } from './messages.utils';

/*******************************************
 * Instantiate store with state
 * Note: The `filteredMessages` value is updated via a 'computed' property
 *******************************************/

export const useMessageStore = createStore<MessagesState>(({ set, addComputedProperty }) => {
  const store = {
    filterBy: '',
    messages: MESSAGES,
    updateFilter(filterBy: string) {
      set((s) => {
        s.filterBy = filterBy;
      });
    },
    filteredMessages: [],
  };

  return addComputedProperty(store, {
    name: 'filteredMessages',
    selectors: [(s: MessagesState) => s.messages, (s: MessagesState) => s.filterBy],
    transform: onlyFilteredMessages,
  });
});
