import { Route } from './Route'

export interface RouteMap<R = Route> {
  [url: string]: R
}

export interface SiteMap<R = Route> {
  redirects: { [name: string]: string }
  routes: RouteMap<R>
}
