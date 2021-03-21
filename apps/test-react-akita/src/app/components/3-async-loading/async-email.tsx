import React from 'react';
import { useStore, MessagesState } from './async-email.store';

export const AsyncEmail: React.FC = () => {
  const state: MessagesState = useStore();

  return (
    <div className="filteredEmails">
      
      
      
      {state.isLoading &&       
        <>
        Loading in 3sec!
        <img src="assets/spinner.gif" width="50%"></img>
        </>
      }

      {!state.isLoading && 
        <>
          Emails:
          <ul>
            {state.emails.map((msg, i) => (
              <div className="message" key={i}>
                <span>{i+1}).</span> {msg}
              </div>
            ))}
          </ul>
          <button onClick={state.refresh}> Refresh </button>
        </>
      }

    </div>
  );
};
