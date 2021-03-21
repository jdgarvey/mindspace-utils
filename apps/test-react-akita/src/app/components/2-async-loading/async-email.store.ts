import { EmailService } from './../../services/email.service';
import { createStore, State } from '@mindspace-io/react-akita';

/**********************************************
 *  Purpose:
 *  Demonstrate the use of 'computed' properties!!
 **********************************************/

/*******************************************
 * Define the state
 *******************************************/

export interface MessagesState extends State {
  timeToReady: number;
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
  const startCountdown = () => {
    const countDown = setInterval(() => {
      set(s => { s.timeToReady -= 1})
    },1000);
    return () => clearInterval(countDown);
  };
  const service = new EmailService();

  return ({
    timeToReady: 3,
    emails: [],
    refresh: async () => {
      api.setIsLoading();
      set(s => { s.emails = [] });  
      
      const stopCountdown = startCountdown();
      const emails = await service.loadAll();

      set(s => {
        s.emails = emails;
        s.isLoading = false;
        s.timeToReady = 3;
      })       
      stopCountdown();
    },
  });
});