import { PageRoute, RedirectRoute } from './Route'
import { LocationState } from './LocationState'

export interface LocationStateMap {
  [url: string]: LocationState
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

export function isRouterLocationStateMapSteady(locationStateMap: LocationStateMap): boolean {
  return Object.values(locationStateMap).every(locationState => locationState.isSteady)
}