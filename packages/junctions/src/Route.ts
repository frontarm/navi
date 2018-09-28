import { Params, URLDescriptor, joinPaths } from './URLTools'
import { Junction } from './Junction'
import { RouterEnv, NotFoundError } from '.';

/**
 * A type that covers all Segment objects.
 */
export type Route = PlaceholderRoute | JunctionRoute | PageRoute | RedirectRoute

export enum Status {
  Ready = 'Ready',
  Busy = 'Busy',
  Error = 'Error',
}

export enum RouteType {
  Placeholder = 'Placeholder',
  Junction = 'Junction',
  Page = 'Page',
  Redirect = 'Redirect',
}

/**
 * All routes extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
export interface GenericRoute {
  type: RouteType

  /**
   * Any params that have been matched.
   */
  params: Params

  /**
   * The part of the URL pathname that has been matched.
   */
  pathname: string

  /**
   * The query string from the URL
   */
  query: Params
}

export interface PlaceholderRoute extends GenericRoute {
  type: RouteType.Placeholder

  nextRoute?: never
  nextPattern?: never
  status: Status
  error?: any
  content?: never
  meta?: never
  title?: never

  lastRemainingRoute?: never
  remainingRoutes: any[]
}

/**
 * Page routes corresponds to a URL segment followed by a final '/'.
 */
export interface PageRoute<Meta = any, Content = any> extends GenericRoute {
  type: RouteType.Page
  content?: Content
  meta?: Meta
  title?: string

  status: Status
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
export interface RedirectRoute<Meta = any> extends GenericRoute {
  to?: string
  meta: Meta
  title?: never
  type: RouteType.Redirect

  content?: never
  status: Status
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
> extends GenericRoute {
  type: RouteType.Junction
  meta: Meta
  title?: never
  junction: Junction<Meta>

  status: Status
  error?: any
  content?: Content

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
    route.status !== Status.Busy &&
    (
      route.type !== RouteType.Junction || (
        !route.lastRemainingRoute ||
        route.lastRemainingRoute.status !== Status.Busy
      )
    )
  )
}

export function createRoute<Type extends string, Details>(type: Type, env: RouterEnv, details: Details) {
  return Object.assign({
    type: type,
    meta: undefined as any,
    params: env.params,
    pathname: env.pathname,
    query: env.query,
    remainingRoutes: (details as any).remainingRoutes || []
  }, details)
}

export function createPlaceholderRoute(env: RouterEnv, error?: any): PlaceholderRoute {
  return createRoute(RouteType.Placeholder, env, {
    status: error ? Status.Error : Status.Busy,
    error: error,
  })
}

export function createNotFoundRoute(env: RouterEnv): PlaceholderRoute {
  let fullPathname = joinPaths(env.pathname, env.unmatchedPathnamePart)
  return {
    type: RouteType.Placeholder,
    params: env.params,
    pathname: fullPathname,
    query: env.query,
    status: Status.Error,
    error: new NotFoundError(fullPathname),
    remainingRoutes: [],
  }
}