import { URLDescriptor, Params } from './URLTools'
import { Route, JunctionRoute, isRouteSteady, PlaceholderRoute, Status } from './Route'

export interface RoutingState {
  url: URLDescriptor

  routes: Route[]
  firstRoute: JunctionRoute
  lastRoute: Route

  /**
   * Indicates that the router context must be changed to cause any more
   * changes.
   */
  isSteady: boolean

  /**
   * Indicates whether the location has fully loaded (including content if
   * content was requested), is still busy, or encountered an error.
   */
  status: Status

  error?: any
}

export function createRoute(url: URLDescriptor, topRoute: JunctionRoute | PlaceholderRoute): RoutingState {
  let routes = [topRoute as Route].concat(topRoute.remainingRoutes)
  let lastRoute = routes[routes.length - 1]
  let status = lastRoute.status

  return {
    url: url,
    routes,
    firstRoute: routes[0] as JunctionRoute,
    lastRoute,
    isSteady: isRouteSteady(routes[0]),
    error: lastRoute && lastRoute.error,
    status,
  } 
}