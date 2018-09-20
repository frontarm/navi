import { Location } from './Location'
import { Route, JunctionRoute, RouteStatus } from './Route'

export interface LocationState {
  location: Location
  url: string
  routes: Route[]
  firstRoute?: JunctionRoute
  lastRoute?: Route

  /**
   * If no route could be found, or the location corrsponds to a junction,
   * then this will be true.
   */
  isNotFound: boolean

  /**
   * Indicates that the router context must be changed to cause any more
   * changes.
   */
  isSteady: boolean
  
  status: RouteStatus
}