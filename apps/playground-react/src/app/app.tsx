import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// import { Header } from './components/_ui/header';
// import { TabItem } from './components/_ui/tabItem';

import './app.scss';
import './tailwind.css';

import { Playground } from './components/playground/playground';

// ************************************
const TITLE = 'Demonstrate use of ';
const App: React.FC = () => {
  return (
    <Playground></Playground>
    // <div className="grid-container bg-red-200">
    //   <div className="header">
    //     <Header />
    //   </div>
    //   <div className="content">
    //     <TabItem url="1-simple-counter/simple-counter.tsx" description={`1) ${TITLE} simple state management`}>
    //       <SimpleCounter />
    //     </TabItem>
    //     <TabItem
    //       url="2-async-loading/async-messages.tsx"
    //       description={`2) ${TITLE}  async loading, status, and transactions`}
    //     >
    //       <AsyncMessages />
    //     </TabItem>
    //     <TabItem
    //       url="3-computed-property/filtered-messages.tsx"
    //       description={`3) ${TITLE}  'computed' properties + debounce`}
    //     >
    //       <FilteredMessages />
    //     </TabItem>
    //     <TabItem
    //       url="4-watch-property/question-answer.tsx"
    //       description={`4) ${TITLE}  'watched' properties + async axios service`}
    //     >
    //       <QuestionAnswer />
    //     </TabItem>

    //     <TabItem url="5-shared-state/unshared-views.tsx" description={`5) ${TITLE}  state is shared across components`}>
    //       <SharedState />
    //     </TabItem>

    //     <TabItem>
    //       <div className="sampleBox"></div>
    //     </TabItem>
    //   </div>
    // </div>
  );
};

export default App;
