import React from 'react';
import { selectViewModel, useStore } from './filtered-messages.store';

/**
 * Show list of messages that container the searchCriteria
 */
export const FilteredMessages: React.FC = () => {
  const [searchCriteria, messages, updateFilterBy] = useStore(selectViewModel);

  return (
    <div className="filteredEmails">

      <div className="filterBy">
        <label htmlFor="filterBy"> Search for: </label>
        <input type="text" 
               value={searchCriteria} 
               onChange={(e) => updateFilterBy(e.target.value)} 
        />
      </div>
      
      Messages:
      
      <ul>
        {messages.map((msg, i) => (
          <li className="message" key={i}>
           {msg}
          </li>
        ))}
      </ul>

    </div>
  );
};
