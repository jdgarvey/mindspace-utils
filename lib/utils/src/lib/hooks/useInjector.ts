import { DependencyInjector, InjectionToken } from '../di';

export type HookTuple<V, I> = [V, I]; // Array of value + injector
export type Token<T> = string | InjectionToken<string> | (new (...args: any[]) => T);

/**
 * `useInjectorHook()` allows applications to build custom hooks that internally use
 * dependency injection to access singleton services, values, etc.
 * 
 * A configured injector instance is required along with and a lookup token.
 * What is returned is a tuple of the singleton instance and the injector.
 * 
 * @code
 *   export const injector: DependencyInjector = makeInjector([
 *     { provide: API_KEY, useValue: '873771d7760b846d51d025ac5804ab' },
 *     { provide: API_ENDPOINT, useValue: 'https://uifaces.co/api?limit=25' },
 *     { provide: ContactsService, useClass: ContactsService, deps: [API_ENDPOINT, API_KEY] }
 *   ]);
 *   
 *   export function useContactsHook(token: any): HookTuple {
 *     return useInjectorHook(token, injector);
 *   }
 * 
 * @param injector is a custom DependencyInjector
 * @param token Look using string, Class, or InjectionToken
 */
export function useInjectorHook<T extends Token<T>>(
  token: T,
  injector: DependencyInjector
): HookTuple<any, DependencyInjector>;
export function useInjectorHook<T extends Token<T>, V>(
  token: T,
  injector: DependencyInjector
): HookTuple<V, DependencyInjector> {
  return [injector.get(token) as V, injector];
}