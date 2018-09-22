import { PageRoute, RedirectRoute } from './Route'
import { RoutingState } from './RoutingState'

export interface RoutingMapState {
  [url: string]: RoutingState
}

export interface SiteMap {
  redirects: RedirectRouteMap
  pages: PageRouteMap
}

export interface PageRouteMap {
  [url: string]: PageRoute
}

export interface RedirectRouteMap {
  [url: string]: RedirectRoute
}

export function isRoutingStateMapSteady(routingStateMap: RoutingMapState): boolean {
  return Object.values(routingStateMap).every(routingState => routingState.isSteady)
}