import { History } from 'history'
import { Router } from './Router'
import { Route } from './Route'
import { Observable } from './Observable'
import { URLDescriptor } from './URLTools'

export interface Navigation<Context extends object=any> extends Observable<NavigationSnapshot> {
  readonly history: History
  readonly router: Router

  setContext(context: Context): void;

  getCurrentValue(): NavigationSnapshot;

  /**
   * Returns a promise that resolves once `isReady()` returns true.
   * This is useful for implementing static rendering, or for waiting until
   * content is loaded before making the first render.
   */
  getSteadySnapshot(): Promise<NavigationSnapshot>;
}

export interface NavigationSnapshot {
  history: History
  router: Router

  route: Route
  url: URLDescriptor

  /**
   * Navigation managers can't scroll to hashes until they've been rendered.
   * To let the manager know that the view has been rendered and scrolling
   * can happen, your view should call this function.
   */
  onRendered: () => void
}