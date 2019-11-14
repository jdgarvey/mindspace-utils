### Dependency Injectors

React does not provide a true _dependency injection_ (DI) infrastructure. In fact, React distorts the View Component hierarchy patterns to provide simulated DI using `<Context.Provider>` + `<Context.Consumer>`.

This implementation provides a programmatic DI that can:

- easily be used at any view level
- supports singleton instances
- supports override (non-singleton) instances
- supports multiple DI providers

Consider this usage:

[![image](https://user-images.githubusercontent.com/210413/67902275-d1e8a000-fb36-11e9-967c-60d2aedc119b.png)
](https://github.com/Mindspace/react-workshop/blob/finish/rxjs/apps/starter/src/app/ui/contacts/contacts-list.tsx#L41)

Where the DI providers were prepared here:

[![image](https://user-images.githubusercontent.com/210413/67991135-30c91a80-fc06-11e9-83f2-efee92f52b32.png)
](https://github.com/Mindspace/react-workshop/blob/finish/rxjs/apps/starter/src/app/%2Bstate/contacts.injector.ts)

> Here is the link to the Injector in [`@mindspace/core`](https://github.com/Mindspace/react-workshop/blob/finish/rxjs/libs/core/src/lib/di/injector.ts)
