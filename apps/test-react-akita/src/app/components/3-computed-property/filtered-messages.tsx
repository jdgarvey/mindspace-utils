import React, { ChangeEvent, useCallback } from 'react';

import { selectViewModel, useStore } from './filtered-messages.store';

export const FilteredMessages: React.FC = () => {
  const [filterBy, messages, updateFilterBy] = useStore(selectViewModel);

  return (
    <div className="filteredEmails">

      <div className="filterBy">
        <label htmlFor="filterBy"> Filter by: </label>
        <input type="text" 
               value={filterBy} 
               onChange={(e) => updateFilterBy(e.target.value)} 
        />
      </div>
      
      Messages:
      
      <ul>
        {messages.map((msg, i) => (
          <div className="message" key={i}>
            <span>{i+1}).</span> {msg}
          </div>
        ))}
      </ul>

    </div>
  );
};
