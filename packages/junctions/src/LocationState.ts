import { Location, createURL } from './Location'
import { Route, JunctionRoute, RouteStatus, isRouteSteady } from './Route'

export interface LocationState {
  location: Location
  url: string
  routes: Route[]
  firstRoute?: JunctionRoute
  lastRoute?: Route

  /**
   * Indicates that the router context must be changed to cause any more
   * changes.
   */
  isSteady: boolean

  /**
   * Indicates whether the location has fully loaded (including content if
   * content was requested), is still busy, or encountered an error.
   */
  status: LocationStateStatus

  error?: any
}

export enum LocationStateStatus {
  Unmanaged = 'Unmanaged',
  Busy = 'Busy',
  Ready = 'Ready',
  Error = 'Error',
}

export function createLocationState(location: Location, topRoute?: JunctionRoute): LocationState {
  let routes = topRoute ? [topRoute as Route].concat(topRoute.remainingRoutes) : []
  let lastRoute = routes[routes.length - 1]
  let status = !lastRoute ? LocationStateStatus.Unmanaged : lastRoute.status

  return {
    location,
    url: createURL(location),
    routes,
    firstRoute: routes[0] as JunctionRoute | undefined,
    lastRoute,
    isSteady: !routes[0] || isRouteSteady(routes[0]),
    error: lastRoute && lastRoute.error,
    status: status as string as LocationStateStatus,
  } 
}