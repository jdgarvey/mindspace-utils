import { InjectionToken } from './injection-token';
import { DependencyInjector, UndoChanges } from './injector.interfaces';
import { makeInjector } from './injector';

describe('DependencyInjector', () => {
  const MSG_TOKEN = new InjectionToken("injector.spec.ts - msg");
  let injector: DependencyInjector;

  describe('with useClass', () => {
    beforeEach(() => {
      injector = makeInjector([
        { provide: MSG_TOKEN, useValue: "Hello Thomas"},
        { provide: A, useClass: A, deps:[MSG_TOKEN]},
        { provide: B, useClass: B, deps:[A]},
        { provide: C, useClass: C, deps:[A]},
        { provide: D, useClass: D, deps:[B, C]},
      ]);
    })

    it('should inject A which has InjectionToken dependencies', () => {
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("Hello Thomas");
    });

    it('should inject B which has A dependencies', () => {
      const instB: B = injector.get(B);

      expect(instB.title).toBe("B");
      expect(instB.a.title).toBe("A");
    });

    it('should inject D which has B + C dependencies', () => {
      const instD: D = injector.get(D);

      expect(instD.title).toBe("D");
      expect(instD.b.title).toBe("B");
      expect(instD.c.title).toBe("C");
    });    

    it('should support mock injection B', () => {
      injector.addProviders([ {provide: B, useClass: MockB } ]);

      const instB: B = injector.get(B);
      expect(instB.title).toBe("MockB");
      expect(instB.a.title).toBe("MockA");

      const instD: D = injector.get(D);
      expect(instD.b.title).toBe("MockB");
    });    

    it('should allow A deps overrides with useFactory', () => {
      injector.addProviders([ { provide: MSG_TOKEN, useFactory: () => "windy" } ])
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");
    });   

    it('should undo changes after addProviders()', () => {
      const undoChanges: UndoChanges = injector.addProviders([ 
        { provide: MSG_TOKEN, useFactory: () => "windy" } 
      ]);
      
      let instA: A = injector.get(A);
      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");

      undoChanges();
      instA = injector.get(A);
      
      expect(instA.msg).toBe("Hello Thomas");
    });   

  });

});



class A { constructor(public msg: string, public title = "A"){} }
class B { constructor(public a: A, public title="B"){ }}
class C { constructor(public a: A, public title="C"){ }}
class D { constructor(public b: B, public c: C, public title="D"){ }}
class MockB {  a = { title: "MockA" }; title = "MockB"; }