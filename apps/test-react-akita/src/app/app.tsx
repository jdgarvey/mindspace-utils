import React from 'react';

import { Header } from './components/header';
import { SimpleCounter } from './components/1-simple-counter/simple-counter';
import { AsyncEmail } from './components/2-async-loading/async-email';
import { FilteredMessages } from './components/3-computed-property/filtered-messages';

import './app.css';

// ************************************

const App: React.FC = () => {
  return (
    <div className="grid-container">
      <div className="header">
        <Header />
      </div>
      <div className="left">
        <div className="sample-info">simple-counter.tsx</div>
        <SimpleCounter />
      </div>
      <div className="center">
        <div className="sample-info">async-email.tsx</div>
        <AsyncEmail />
      </div>
      <div className="right">
        <div className="sample-info">filtered-messages.tsx</div>
        <FilteredMessages />
      </div>
    </div>
  );
};

export default App;
