import React from 'react';

import { selectMessageVM } from './messages.interfaces';
import { useMessageStore } from './messages.store';

/**
 * Show list of messages that container the searchCriteria
 */
export const FilteredMessages: React.FC = () => {
  const [searchCriteria, messages, updateSearchBy] = useMessageStore(selectMessageVM);
  //const [searchCriteria, messages, updateSearchBy] = useMessages();

  return (
    <div className="sampleBox">
      <div className="filterBy">
        <label htmlFor="filterBy"> Filter by: </label>
        <input type="text" value={searchCriteria} onChange={(e) => updateSearchBy(e.target.value)} />
      </div>
      Messages:
      <ul>
        {messages.map((msg, i) => (
          <li className="message" key={i} dangerouslySetInnerHTML={{ __html: msg }} />
        ))}
      </ul>
    </div>
  );
};
