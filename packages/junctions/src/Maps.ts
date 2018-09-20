import { JunctionRoute, PageRoute, RedirectRoute, isRouteSteady } from './Route'

export interface RouterLocationStateMap {
  // TODO: update this to RouterLocationState
  [url: string]: JunctionRoute
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

export function isRouterLocationStateMapSteady(routerLocationStateMap: RouterLocationStateMap): boolean {
  return Object.values(routerLocationStateMap).every(isRouteSteady)
}