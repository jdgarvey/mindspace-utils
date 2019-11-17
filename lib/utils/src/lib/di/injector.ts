import { DependencyInjector, UndoChange } from './injector.interfaces';
import { Provider, TypeProvider, makeClassProvider } from './injector.interfaces';

/**
 * Utility function used to easily create 1..n injectors; each with thier
 * own singletons and provider registry.
 * 
 * NOTE: If only a class is registered (instead of a Provider), convert to it 
 * for normalized usages
 */
export function makeInjector(registry: (Provider | TypeProvider)[]): DependencyInjector {
  const normalized = registry.map(it => {
    const isProvider = !!(it as Provider).provide;
    return isProvider ? it : makeClassProvider(it);
  }) as Provider[];

  return new Injector(normalized);
}

/**
 * Injector class that manages a registry of Providers and a registry
 * of singleton instances [singletons for the instance of the injector]
 */
class Injector implements DependencyInjector {
  private singletons = new WeakMap();

  constructor(private providers: Provider[] = []) {
    this.addProviders(providers);
  }

  /**
   * Lookup singleton instance using token
   * Optionally create instance and save as singleton if needed
   */
  get(token: any): any {
    return this.findAndMakeInstance(token);
  }

  /**
   * Create an unshared, non-cached instance of the token;
   * based on the Provider configuration
   */
  instanceOf(token: any): any {
    const provider = this.findLastRegistration(token, this.providers);
    const deps = provider && provider.deps ? provider.deps.map(it => this.instanceOf(it)) : [];
    const makeWithClazz = (clazz: any) => (clazz ? new clazz(...deps) : null);
    const makeWithFactory = (fn: () => any) => (fn ? fn.call(null, deps) : null);

    return provider && ( provider.useValue
      || makeWithClazz(provider.useClass) 
      || makeWithFactory(provider.useFactory)
      || makeWithClazz(provider.provide)  // fallback uses the token as a `class`
    );
  }

  /**
   * Dynamically allow Provider registrations and singleton overwrites
   * Provide an 'restore' function to optionally restore original providers (if replaced),
   * 
   * @param registry Configuration set of Provider(s)
   * @param replace Replace existing provider
   */
  addProviders(registry: Provider[], replace = true): UndoChange {
    const origProviders = [...this.providers];    
    const cache = replace
      ? this.providers.reduce((list, current) => {
          const isSameToken = newItem => newItem.provide === current.provide;
          const notFound = registry.filter(isSameToken).length < 1;
          return notFound ? list.concat([current]) : list;
        }, [])
      : this.providers;

    this.providers = cache.concat(registry);
    registry.map(it => this.singletons.delete(it.provide));

    return () => this.addProviders(origProviders);
  }

  // *************************************************
  // Private  Methods
  // *************************************************

  /**
   * Find last Provider registration (last one wins)
   */
  private findLastRegistration(token: any, list: Provider[]) {
    const registry = this.providers.filter(it => it.provide === token);
    return registry.length ? registry[registry.length - 1] : null;
  }

  /**
   * Based on provider registration, create instance of token and save
   * as singleton value.
   * @param token Class, value, or factory
   */
  private findAndMakeInstance(token: any): any {
    let result = this.singletons.get(token) || this.instanceOf(token);
    this.singletons.set(token, result);
    return result;
  }
}
