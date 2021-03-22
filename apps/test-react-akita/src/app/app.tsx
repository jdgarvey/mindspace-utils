import React from 'react';

import { Header } from './components/header';
import { SimpleCounter } from './components/1-simple-counter/simple-counter';
import { AsyncMessages } from './components/2-async-loading/async-messages';
import { FilteredMessages } from './components/3-computed-property/filtered-messages';

import './app.scss';

const ROOT = 'https://github.com/ThomasBurleson/mindspace-utils/blob/master/apps/test-react-akita/src/app/components';
// ************************************

const App: React.FC = () => {
  return (
    <div className="grid-container">
      <div className="header">
        <Header />
      </div>
      <div className="content">
        <div className="left">
          <div className="sample-info">
            <a href={`${ROOT}/1-simple-counter/simple-counter.tsx`} target="_blank">
              simple-counter.tsx
            </a>
          </div>
          <SimpleCounter />
        </div>
        <div className="center">
          <div className="sample-info">
            <a href={`${ROOT}/2-async-loading/async-email.tsx`} target="_blank">
              async-email.tsx
            </a>
          </div>
          <AsyncMessages />
        </div>
        <div className="right">
          <div className="sample-info">
            <a href={`${ROOT}/3-computed-property/filtered-messages.tsx`} target="_blank">
              filtered-messages.tsx
            </a>
          </div>
          <FilteredMessages />
        </div>
      </div>
    </div>
  );
};

export default App;
