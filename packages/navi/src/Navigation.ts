import { History } from 'history'
import { Router } from './Router'
import { Route } from './Route'
import { Observable } from './Observable'

export interface Navigation<Context extends object=any> extends Observable<Route> {
  readonly history: History
  readonly router: Router

  setContext(context: Context): void;

  getCurrentValue(): Route;

  /**
   * Returns a promise that resolves once `isReady()` returns true.
   * This is useful for implementing static rendering, or for waiting until
   * content is loaded before making the first render.
   */
  getSteadyValue(): Promise<Route>;

  steady(): Promise<void>;

  dispose(): void;
}
