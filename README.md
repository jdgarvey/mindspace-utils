# Mindspace RxJS Utilities

## Purpose

This library provides utilities to auto-unsubscribe [from a RxJS stream subscription] when a view component is destroyed. While originally written for Angular developers, some of the utilities can be used with **any** JS + RxJS implementation.

* `untilViewDestroyed(<ElementRef>)`: RxJS operator to auto-unsubscribe when the Angular view instance is destroyed.
* `autoUnsubscribe(<Subscription>,<HtmlElement>)`: clear the specified subscription when the target DOM element is removed from its parent DOM container.
* `watchwatchElementDestroyed(<HtmlElement>)`: watch target DOM element and emit true when destroyed.
 
 
## Using @mindspace/rxjs-utils

The `untilViewDestroyed()` RxJS operator is the most commonly used feature. Review the code sample below on how to auto-unsubscribe an Angular View component after `ngOnDestroy()`.

```ts
import {untilViewDestroyed} from '@mindspace/rxjs-utils';
   
@Component({})   
export class TicketDetails {  
 tickets: string[];
 search: FormControl;  

 constructor(private ticketService: TicketService, private elRef: ElementRef){}

 ngOnInit() {   
   const findTickets = (criteria:string) => this.ticketService.findAll(criteria);
  
   this.search.valueChanges.pipe(  
     untilViewDestroyed(elRef),  
     switchMap(findTickets), 
     map(ticket=> ticket.name)  
   )   
   .subscribe( tickets => this.tickets = tickets ); 
 } 
 
}
```

This is a contrived example that does not itself use the power of the `async` pipe.

Nevertheless, developers will encounter other scenarios that require manual subscriptions and subscription management. And then `untilViewDestroyed()` becomes a very useful RxJS operator. 

<br/>

----

<br/>

## Classic Approaches (without rxjs-utils)

### Angular RxJS Issue 

Consider the following `DocumentViewerComponent` which uses a service to load a list of documents`. `availableDocuments$` is a RxJS stream which will asynchronously emit/deliver the document list WHENEVER it is available or changes. 

```ts
@Component({
  selector: 'document-viewer',
  template: `
    <h1>Documents for {{fullName}}</h1>
    <document-list [dataProvider]="documents">
    </document-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentViewerComponent implements OnInit {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.service.availableDocuments$.subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }
}
```

This implementation has a memory leak because the subscription is long-lived and is not managed!

### Angular RxJS Solution using `ngOnDestroy()`

Here is the typical implementation [using `ngOnDestroy()` + `takeUntil()`] to manage such RxJS subscriptions:

```ts
@Component({...})
export class DocumentViewerComponent implements OnInit {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngOnInit(): void {
    this._subscription = this.service.availableDocuments$.subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }

  private _subscription: Subscription;
}
```

Here is another approach [using a notification Subject] that is often used in-the-wild:
 
```ts
@Component({...})
export class DocumentViewerComponent implements OnInit {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._notifier.next();
    this._notifier.complete();
  }

  ngOnInit(): void {
    this.service.availableDocuments$.pipe(
      takeUntil(this._notifier.asObservable())
    ).subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }

  private _notifier = new Subject<void>();
}
```

Notice how this both of these approaches require *extra view logic* simply to using the **OnDestroy** lifecycle event to auto-unsubscribe. And when trying to manage multiple subscriptions in a single component, these approaches require code that significantly *pollutes* your view implementation.

To avoid view-code cruft, use the `@mindspace/rxjs-utils`!
