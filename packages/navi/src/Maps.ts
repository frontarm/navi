import { Route, PageRoute, RedirectRoute } from './Route'

export interface RouteMap {
  [url: string]: Route
}

export interface SiteMap<Meta extends object = any, Content extends object = any> {
  redirects: RedirectMap<any>
  pages: PageMap<Meta, Content>
}

export interface PageMap<Meta extends object = any, Content extends object = any> {
  [url: string]: PageRoute<Meta, Content>
}

export interface RedirectMap<Meta extends object = any> {
  [url: string]: RedirectRoute<Meta>
}

export function isRouteMapSteady(routeMap: RouteMap): boolean {
  return Object.values(routeMap).every(route => route.isSteady)
}