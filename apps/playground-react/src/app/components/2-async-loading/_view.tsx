import React, { useContext, useState } from 'react';

import { EmailService } from './messages.service';
import { MessagesState } from './messages.interfaces';
import { makeStore } from './messages.store';

export const AsyncMessages: React.FC = () => {
  const [service] = useState<EmailService>(() => new EmailService());
  const [useMessageStore] = useState(() => makeStore(service));

  const state: MessagesState = useMessageStore();

  return (
    <div className="sampleBox">
      {state.isLoading && (
        <>
          Loading in <span className="count"> {state.timeToReady} </span> sec!
          <img src="assets/spinner.gif" width="30%"></img>
        </>
      )}

      {!state.isLoading && (
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
      )}
    </div>
  );
};
