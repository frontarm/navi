import { Route, PageRoute, RedirectRoute } from './Route'

export interface RouteMap {
  [url: string]: Route
}

export interface SiteMap<Info extends object = any, Content extends object = any> {
  redirects: RedirectMap<any>
  pages: PageMap<Info, Content>
}

export interface PageMap<Info extends object = any, Content extends object = any> {
  [url: string]: PageRoute<Info, Content>
}

export interface RedirectMap<Info extends object = any> {
  [url: string]: RedirectRoute<Info>
}

export function isRouteMapSteady(routeMap: RouteMap): boolean {
  return Object.values(routeMap).every(route => route.isSteady)
}