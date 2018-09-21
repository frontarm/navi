import { PageRoute, RedirectRoute } from './Route'
import { RoutingState } from 'junctions/src/RoutingState'

export interface RoutingStateMap {
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

export function isRoutingStateMapSteady(routingStateMap: RoutingStateMap): boolean {
  return Object.values(routingStateMap).every(routingState => routingState.isSteady)
}