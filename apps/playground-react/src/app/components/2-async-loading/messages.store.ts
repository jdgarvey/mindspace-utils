import { createStore, UseStore } from '@mindspace-io/react';

import { EmailService } from './messages.service';
import { MessagesState } from './messages.interfaces';

/**********************************************
 *  Reactive Store Solution:
 *  Demonstrate the use of Reactive store 'async mutators'
 **********************************************/

export const makeStore = (emailService: EmailService): UseStore<MessagesState> => {
  const service = new EmailService();
  const useStore = createStore<MessagesState>(({ set, setIsLoading, applyTransaction }) => {
    const decrement = () =>
      set((s) => {
        s.timeToReady -= 1;
      });
    const startCountdown = () => {
      const countDown = setInterval(decrement, 1000);
      return () => clearInterval(countDown);
    };

    return {
      messages: [],
      timeToReady: 3,
      async refresh() {
        applyTransaction(() => {
          setIsLoading();
          set((s) => {
            s.messages = [];
          });
        });

        const stopCountdown = startCountdown();
        const messages = await service.loadAll();

        applyTransaction(() => {
          set((s) => {
            s.messages = messages;
            s.isLoading = false;
            s.timeToReady = 3;
          });
          stopCountdown();
        });
      },
    };
  });

  return useStore;
};
