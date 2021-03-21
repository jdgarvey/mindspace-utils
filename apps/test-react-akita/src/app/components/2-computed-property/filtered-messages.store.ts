import { createStore, State, StateSelector, ComputedProperty, addComputedProperty } from '@mindspace-io/react-akita';

/**********************************************
 *  Purpose:
 *  Demonstrate the use of 'computed' properties!!
 **********************************************/

/*******************************************
 * Define the state
 *******************************************/

export interface MessagesState extends State {
  filterBy: string;
  messages: string[];
  updateFilter: (filterBy: string) => void;
  
  // Computed properties
  filteredMessages: string[]; 
}

/*******************************************
 * Define the view model
 * Define a selector function to extract ViewModel from `useStore(<selector>)`
 *******************************************/

export type ViewModel = StateSelector<MessagesState, [string, string[], (v: string) => void]>;

export const selectViewModel: ViewModel = (s: MessagesState) => {
  return [s.filterBy, s.filteredMessages, s.updateFilter];
};

/*******************************************
 * Instantiate store with state
 *
 * Note: The `filteredMessages` value is updated via a 'computed' property
 *
 *******************************************/

const MESSAGES = [
  'Can you pickup some organic food on the way home?',
  'The veterinarian called. X-rays showed your dog is fine.',
  'Obesity is a pandemic in the USA',
  'Spotify is an amazing music service',
];

export const useStore = createStore<MessagesState>((set) => ({
  filterBy: '',
  messages: MESSAGES,
  updateFilter(filterBy: string) {
    set((s) => {
      s.filterBy = filterBy;
    });
  },

  // Computed properties; placeholder key & value
  filteredMessages: [], 
}));

addComputedProperty(useStore, computeFilteredMessages());

// *************************************************
// Private Utils
// *************************************************

/**
 * Build computed property for `filteredMessages`
 * Uses an array of selectors for optimized change propagation
 */
function computeFilteredMessages(): ComputedProperty<MessagesState, string[] | string, string[]> {
  const getFilteredMessages = ([messages, filterBy]): string[] => {
    const criteria = filterBy.toLowerCase();
    const containsFilterValue = (s:string) => (s.toLowerCase().indexOf(criteria) > -1);
    return !!filterBy ? messages.filter(containsFilterValue) : [...messages];
  };

  return {
    name: 'filteredMessages',
    selectors: [(s: MessagesState) => s.messages, (s: MessagesState) => s.filterBy] as any[],
    predicate: getFilteredMessages,
  };
}
