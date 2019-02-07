import { Route, ContentRoute, RedirectRoute } from './Route'

export interface RouteMap {
  [url: string]: Route
}

export interface SiteMap<Info extends object = any, Content extends object = any> {
  redirects: RedirectMap
  pages: PageMap<Info, Content>
}

export interface PageMap<Info extends object = any, Content extends object = any> {
  [url: string]: ContentRoute<Info, Content>
}

export interface RedirectMap {
  [url: string]: RedirectRoute
}

export function isRouteMapSteady(routeMap: RouteMap): boolean {
  return Object.values(routeMap).every(route => route.type !== 'busy')
}