## TypeScript Utils

### [**`EventBus`**](./event-bus.ts)

To reduce fragile component couplings and circular DI scenarios, the EventBus can be as a global messaging system that enables disconnected services to _communicate_ with
global events.

Consider two services:

- OrderList Facade: manages a collection of orders and a total summary
- Order Facade: manage a single order and a collection of order items.

When the `OrderFacade` is modified, the `OrderListFacade` needs to refresh its own collection and summary totals.

To keep the two (2) facades independent, an EventBus is used to communicate:

```ts
export class OrderListFacade {

  constructor(private eventBus: EventBus) {

    eventBus.on(
      BusEventTypes.ORDER_UPDATED,
      this.onOrderChanged.bind(this)
    );
  }
```

```ts
export class OrderFacade {
  order$: Observable<Order>;

  constructor(private eventBus: EventBus) {
    // Announce order changes
    this.order$.subscribe(order => {
      if (order) {
        eventBus.emit(orderUpdated(order));
      }
    });
  }
```

> Note that the EventBus is an **injected service singleton**.

<br>

### [**`switchCase()`**](./switchCase.ts)

We often want to reduce the verbosity of a stand `switch()` block into something more consumable. Using functional approaches we can easily implement code like the samples shown below.

> We can also use TypeScript to provide IDE intellisense errors.

```ts

const dayofWeek = switchCase({
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
},'Unknown'));

const currentDay = dayofWeek(new Date().getDay())

```

We can also easily use the `switchCase()` to implement terse Redux reducers:

```ts
export const counterReducer = <T extends ActionNames<typeof handleAction>>(state: number, action: { type: T }) => {
  const handleAction = switchCase(
    {
      INCREMENT: () => state + 1,
      DECREMENT: () => state - 1,
      RESET: 0
    },
    state
  );
  return handleAction(action.type);
};

console.log(counterReducer(0, { type: 'INCREMENT' })); // perfect
console.log(counterReducer('wrong', { type: 'FOO' })); // intellisense shows errors
console.log(counterReducer(0, { type: 'FOO' })); // intellisense shows errors
```
