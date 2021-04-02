## React Custom Hooks

React view components use state and props to render JSX (templates).
Using RxJS and streams to deliver data and state involves risk and requires careful stream management:

- subscribe to the stream
- update the component state with emitted stream values
- trigger view component re-renders
  - when a new observable instance replaces a previous instance

And - when the component unmounts - all associated streams should also be unsubscribed.

> For Angular developers, this hook provides the same functionality as the template `async` pipe.

<br/>

### `useObservable` Hook

In RxJS scenarios where state values will be updated asynchronously based on emissions from Observable streams, the required code complexity becomes problematic.

_`useObservable<T>()`_ is 'typed' custom hook that dramatically simplifies the implementation of these ^ requirements. The hook itself internally manages the subscription lifecycles and dramatically reduces the code previously required withing a React view component.

[![image](https://user-images.githubusercontent.com/210413/67902428-2724b180-fb37-11e9-9904-558952d2cf66.png)
](https://github.com/Mindspace/react-workshop/blob/finish/rxjs/apps/starter/src/app/ui/contacts/contacts-list.tsx#L41-L55)
