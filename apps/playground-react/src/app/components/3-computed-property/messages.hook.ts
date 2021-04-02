import { useState } from 'react';

import { onlyFilteredMessages, MESSAGES } from './messages.utils';
import { MessagesVM } from './messages.interfaces';

export function useMessages(): MessagesVM {
  const [filterBy, updateFilter] = useState('');
  const [messages] = useState(MESSAGES);

  return [filterBy, onlyFilteredMessages([messages, filterBy]), updateFilter];
}
