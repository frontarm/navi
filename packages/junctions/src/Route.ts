import { Location } from './Location'
import { ResolvableNode, Node } from './Node'
import { Page } from './Page'
import { ResolverStatus } from './Resolver'
import { Junction, JunctionPaths } from './Junction'
import { Redirect } from './Redirect'

/**
 * A type that covers all Segment objects.
 */
export type Route = JunctionRoute | PageRoute | RedirectRoute

export enum RouteStatus {
  Ready = 'Ready',
  Busy = 'Busy',
  Error = 'Error',
}

export enum RouteContentStatus {
  Unrequested = 'Unrequested',
  Busy = 'Busy',
  Ready = 'Ready',
  Error = 'Error',
}

export enum RouteType {
  Junction = 'Junction',
  Page = 'Page',
  Redirect = 'Redirect',
}

/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
interface RouteBase {
  type: RouteType

  /**
   * Any params that have been matched.
   */
  params?: { [name: string]: any }

  /**
   * A Location object representing the part of the URL that has been
   * matched.
   */
  location: Location

  /**
   * The part of the entire URL string that has been matched.
   */
  url: string

  /**
   * The Template object which created this Route Segment.
   */
  node: Node
}

/**
 * Page routes corresponds to a URL segment followed by a final '/'.
 */
export interface PageRoute<Meta = any, Content = any> extends RouteBase {
  content?: Content
  meta: Meta
  title: string
  type: RouteType.Page

  contentStatus: RouteContentStatus
  contentError?: any

  status: RouteStatus // is always ready
  error?: never

  nextRoute?: never
  nextPattern?: never
  lastRemainingRoute?: never
  remainingRoutes: any[]
}

/**
 * Redirect routes indicate that anything underneath this route
 * should be redirected to the location specified at `to`.
 */
export interface RedirectRoute<Meta = any> extends RouteBase {
  to?: Location
  meta: Meta
  type: RouteType.Redirect

  content?: never
  contentStatus?: never
  contentError?: never

  status: RouteStatus
  error?: any

  nextRoute?: never
  nextPattern?: never
  lastRemainingRoute?: never
  remainingRoutes: any[]
}

/**
 * Junction routes correspond to non-final segment of the URL.
 */
export interface JunctionRoute<
  Meta = any,
  Content = any,
> extends RouteBase {
  type: RouteType.Junction
  meta: Meta
  junction: Junction<Meta>

  status: RouteStatus
  error?: any

  // TODO: content for junctions
  content?: Content
  contentStatus: RouteContentStatus
  contentError?: any

  /**
   * The pattern that was matched (with param placeholders if applicable).
   */
  nextPattern?: string

  /**
   * A route object that contains details on the next part of the URL.
   *
   * It may be undefined if the user has provided an incorrect URL, or
   * if the child's template still needs to be loaded.
   */
  nextRoute?: Route

  /**
   * An array of all Segment objects corresponding to the remaining parts
   * of the URL.
   *
   * It may be undefined if the user has provided an incorrect URL, or
   * if the child's template still needs to be loaded.
   */
  remainingRoutes: Route[]

  /**
   * Contains the final route object, whatever it happens to be.
   */
  lastRemainingRoute?: Route
}
    
export function isRouteSteady(route: Route): boolean {
  return (
    route.status !== RouteStatus.Busy &&
    (
      (route.type === RouteType.Page && route.contentStatus !== RouteContentStatus.Busy) ||
      (route.type === RouteType.Junction && (
        !route.lastRemainingRoute ||
        (route.lastRemainingRoute.status !== RouteStatus.Busy && route.lastRemainingRoute.contentStatus !== RouteContentStatus.Busy)
      ))
    )
  )
}
