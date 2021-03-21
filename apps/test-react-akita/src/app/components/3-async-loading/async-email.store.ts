import { EmailService } from './../../services/email.service';
import { createStore, State, StateSelector } from '@mindspace-io/react-akita';

/**********************************************
 *  Purpose:
 *  Demonstrate the use of 'computed' properties!!
 **********************************************/

/*******************************************
 * Define the state
 *******************************************/

export interface MessagesState extends State {
  emails: string[];
  refresh: () => void; 
}

/*******************************************
 * Instantiate store with state
 *
 * Note: The `filteredMessages` value is updated via a 'computed' property
 *
 *******************************************/


export const useStore = createStore<MessagesState>((set, _, api) => {
  const service = new EmailService();
  return ({
    emails: [],
    refresh: async () => {
        api.setIsLoading();
        set(s => { s.emails = [] });  

        const emails = await service.loadAll();
        set(s => {
          s.emails = emails;
          s.isLoading = false;
        })        
    },
  });
});

