import { Type } from './type';
import { DependencyInjector } from './injector.interfaces';

export interface TypeProvider extends Type<any> {
  deps?: any[];
}

export interface Provider {
  provide: any;
  useClass?: any;
  useValue?: any;
  useFactory?: () => any;
  deps?: any[];
}

export type UndoChanges = () => void;

export interface DependencyInjector {
  get: (token: any) => any;
  instanceOf: (token: any) => any;
  addProviders: (registry: Provider[]) => UndoChanges;
}

export function makeClassProvider(token:any): Provider {
  return {
    provide: token,
    useClass: token,
    deps: [...token['deps']],
  };
}
