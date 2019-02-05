import { Params, joinPaths, URLDescriptor, createURLDescriptor } from './URLTools'
import { Switch } from './Switch'
import { NotFoundError } from './Errors'
import { Status } from './Resolver'
import { NaviRequest } from './NaviRequest'

/**
 * A type that covers all Segment objects.
 */
export type RouteSegment =
  | PlaceholderSegment
  | SwitchSegment
  | PageSegment
  | RedirectSegment

export type RouteSegmentType =
  | 'placeholder'
  | 'switch'
  | 'page'
  | 'redirect'

/**
 * All segments extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
export interface GenericSegment {
  type: RouteSegmentType

  /**
   * Any params that have been matched.
   */
  params: Params

  /**
   * The part of the URL pathname that has been matched.
   */
  url: URLDescriptor
}

/**
 * Placeholder segments appear at the end of a route that is still being
 * resolved.
 */
export interface PlaceholderSegment extends GenericSegment {
  type: 'placeholder'

  nextSegment?: never
  nextPattern?: never
  status: Status
  error?: any
  content?: never
  head?: never
  info?: never
  title?: never

  lastRemainingSegment?: never
  remainingSegments: any[]
}

/**
 * Page segments corresponds to a URL segment followed by a final '/'.
 */
export interface PageSegment<Info extends object = any, Content = any>
  extends GenericSegment {
  type: 'page'
  content?: Content
  info?: Info
  head?: any[] | JSX.Element
  title?: string

  status: Status
  error?: never

  nextSegment?: never
  nextPattern?: never
  lastRemainingSegment?: never
  remainingSegments: any[]
}

/**
 * Redirect segments indicate that anything underneath this segment
 * should be redirected to the location specified at `to`.
 */
export interface RedirectSegment<Info extends object = any>
  extends GenericSegment {
  to?: string
  info?: Info
  title?: never
  type: 'redirect'

  content?: never
  head?: never
  status: Status
  error?: any

  nextPattern?: never
}

/**
 * Switch segments correspond to non-final segment of the URL.
 */
export interface SwitchSegment<Info extends object = any, Content = any>
  extends GenericSegment {
  type: 'switch'
  info?: Info
  title?: string
  switch: Switch<any, Info, Content>

  status: Status
  error?: any
  content?: Content
  head?: any[] | JSX.Element

  /**
   * The pattern that was matched (with param placeholders if applicable).
   */
  nextPattern?: string
}

export function createRouteSegment<Type extends string, Details>(
  type: Type,
  request: NaviRequest,
  details: Details,
  ensureTrailingSlash = true,
) {
  (details as any).meta = (details as any).info

  return Object.assign(
    {
      type: type,
      info: undefined as any,
      params: request.params,
      url: createURLDescriptor({
        pathname: request.mountpath,
        query: request.query,
      }, { ensureTrailingSlash }),
      remainingSegments: (details as any).remainingSegments || [],
    },
    details,
  )
}

export function createPlaceholderSegment(
  request: NaviRequest,
  error?: any,
  ensureTrailingSlash = true,
): PlaceholderSegment {
  return createRouteSegment('placeholder', request, {
    status: (error ? 'error' : 'busy') as Status,
    error: error,
  }, ensureTrailingSlash)
}

export function createNotFoundSegment(request: NaviRequest): PlaceholderSegment {
  let fullPathname = joinPaths(request.mountpath, request.path)
  let error = new NotFoundError(fullPathname)
  return {
    type: 'placeholder',
    params: request.params,
    url: createURLDescriptor({
      pathname: fullPathname,
      query: request.query,
    }),
    status: 'error',
    error: error,
    remainingSegments: [],
  }
}
