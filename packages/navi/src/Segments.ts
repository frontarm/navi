import { joinPaths, URLDescriptor, createURLDescriptor } from './URLTools'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest'
import { Resolution } from './Resolver'

/**
 * A type that covers all Segment objects.
 */
export type Segment =
  | BusySegment
  | DataSegment
  | ErrorSegment
  | HeadSegment
  | HeadersSegment
  | MapSegment
  | NullSegment
  | RedirectSegment
  | StatusSegment
  | TitleSegment
  | URLSegment
  | ViewSegment

export type SegmentType =
  | 'busy'
  | 'data'
  | 'head'
  | 'headers'
  | 'error'
  | 'map'
  | 'null'
  | 'redirect'
  | 'status'
  | 'title'
  | 'url'
  | 'view'

/**
 * All segments extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
export interface GenericSegment {
  type: SegmentType

  /**
   * The part of the URL pathname that has been matched.
   */
  url: URLDescriptor

  error?: any
  to?: any
  view?: any
  map?: any
}


/**
 * This is used in place of a segment of another type whose final result is
 * not yet known.
 */
export interface BusySegment extends GenericSegment {
  type: 'busy'
  promise: PromiseLike<any>
}

/**
 * Data segments contain information that will be available on the produced
 * route object, but isn't meant to be rendered with the page itself.
 */
export interface DataSegment<Data=any> extends GenericSegment {
  type: 'data'
  data: Data
}

/**
 * When encountered in a route by a `<NavView>`, this will be thrown, and
 * can then be handled by an Error Boundary. Behavior for handling error
 * segments on the server side is undefined.
 */
export interface ErrorSegment extends GenericSegment {
  type: 'error'
  error: any
}

/**
 * Can be used to specify data for your page's <head> separately from
 * the view content.
 */
export interface HeadSegment extends GenericSegment {
  type: 'head'
  head: any
}

/**
 * Used to specify any headers for your HTTP response.
 */
export interface HeadersSegment extends GenericSegment {
  type: 'headers'
  headers: { [name: string]: string }
}

/**
 * Map segments are added for each map that is routed through. They're
 * useful for building maps, as they hold metadata on other possible paths.
 */
export interface MapSegment extends GenericSegment {
  type: 'map'
  patterns: string[]
}

/**
 * Added in place of child segments when a child returns an empty list of
 * segments, to prevent the length of the segments list from decreasing.
 */
export interface NullSegment extends GenericSegment {
  type: 'null'
}

/**
 * When added to a route, indicates that the client should follow the redirect
 * to the given address.
 */
export interface RedirectSegment extends GenericSegment {
  type: 'redirect'
  to: string
}

/**
 * Used to specify the status of your HTTP response.
 */
export interface StatusSegment extends GenericSegment {
  type: 'status'
  status: number
}

/**
 * Allows matchers to specify a <title> tag, or document title.
 */
export interface TitleSegment extends GenericSegment {
  type: 'title'
  title: string
}

/**
 * Contains the full URL that should be used for the route, including any hash.
 */
export interface URLSegment extends GenericSegment {
  type: 'url'
}

/**
 * View segments contain data that will be used in a response on the
 * server, or that will be rendered in the browser. They can contain error
 * or redirect information, but they'll still be rendered as-is in the client.
 */
export interface ViewSegment<View=any> extends GenericSegment {
  type: 'view'
  view: View
}


export function createSegment<Type extends string, Details>(
  type: Type,
  request: NaviRequest,
  details?: Details,
  ensureTrailingSlash = true,
) {
  return Object.assign({
    type: type,
    url: createURLDescriptor({
      pathname: request.mountpath,
      query: request.query,
    }, { ensureTrailingSlash }),
  }, details)
}

export function createNotReadySegment(
  request: NaviRequest,
  resolution: Resolution<any>,
  ensureTrailingSlash = true,
): BusySegment | ErrorSegment {
  if (resolution.error) {
    return createSegment('error', request, { error: resolution.error }, ensureTrailingSlash)  
  }
  return createSegment('busy', request, { promise: resolution.promise! }, ensureTrailingSlash)
}

export function createNotFoundSegment(request: NaviRequest): ErrorSegment {
  let fullPathname = joinPaths(request.mountpath, request.path)
  return {
    type: 'error',
    url: createURLDescriptor({
      pathname: fullPathname,
      query: request.query,
    }),
    error: new NotFoundError(fullPathname),
  }
}
