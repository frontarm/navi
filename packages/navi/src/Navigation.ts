import { History } from 'history'
import { Router } from './Router'
import { RoutingState } from './RoutingState'
import { Observable } from './Observable'

export interface Navigation extends Observable<NavigationState> {
  readonly history: History
  readonly router: Router

  /**
   * Returns a promise that resolves once `isReady()` returns true.
   * This is useful for implementing static rendering, or for waiting until
   * content is loaded before making the first render.
   */
  getSteadyState(): Promise<NavigationState>;
}

export interface NavigationState extends RoutingState {
  history: History
  router: Router

  /**
   * Navigation managers can't scroll to hashes until they've been rendered.
   * To let the manager know that the view has been rendered and scrolling
   * can happen, your view should call this function.
   */
  onRendered: () => void
}