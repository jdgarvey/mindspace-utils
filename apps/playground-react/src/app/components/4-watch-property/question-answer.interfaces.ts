import { State, StateSelector } from '@mindspace-io/react';

export interface QAState extends State {
  // Data
  question: string;
  answer: string;

  // Mutators
  updateQuestion: (answer: string) => void;
}

/*******************************************
 * Define the view model
 * Define a selector function to extract ViewModel from `useStore(<selector>)`
 *******************************************/

export type QAViewModel = [string, string, (question: string) => void];

export const selectViewModel: StateSelector<QAState, QAViewModel> = (s: QAState) => [
  s.question,
  s.answer,
  s.updateQuestion,
];
