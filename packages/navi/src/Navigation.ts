import { History } from 'history'
import { Router } from './Router'
import { Route } from './Route'
import { Observable } from './Observable'

export interface Navigation<Context extends object=any, R=Route> extends Observable<R> {
  readonly history: History
  readonly router: Router<Context, R>

  setContext(context: Context): void;

  getCurrentValue(): R;

  /**
   * Returns a promise that resolves once `isReady()` returns true.
   * This is useful for implementing static rendering, or for waiting until
   * content is loaded before making the first render.
   */
  getSteadyValue(): Promise<R>;

  steady(): Promise<void>;

  dispose(): void;
}
