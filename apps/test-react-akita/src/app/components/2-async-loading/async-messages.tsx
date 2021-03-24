import React from 'react';
import { useStore, MessagesState } from './async-messages.store';

export const AsyncMessages: React.FC = () => {
  const state: MessagesState = useStore();

  return (
    <div className="sampleBox">
      {state.isLoading &&       
        
        <>
          Loading in <span className="count"> {state.timeToReady} </span> sec!
          <img src="assets/spinner.gif" width="30%"></img>
        </>
        
      }

      {!state.isLoading && 
        <>
          Emails:
          <ul>
            {state.messages.map((msg, i) => (
              <li className="message" key={i}>
                {msg}
              </li>
            ))}
          </ul>
          <button onClick={state.refresh}> Refresh </button>
        </>
      }

    </div>
  );
};
