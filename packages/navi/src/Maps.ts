import { Route, PageRoute, RedirectRoute } from './Route'

export interface RouteMap {
  [url: string]: Route
}

export interface SiteMap {
  redirects: RedirectMap
  pages: PageMap
}

export interface PageMap {
  [url: string]: PageRoute
}

export interface RedirectMap {
  [url: string]: RedirectRoute
}

export function isRouteMapSteady(routeMap: RouteMap): boolean {
  return Object.values(routeMap).every(route => route.isSteady)
}