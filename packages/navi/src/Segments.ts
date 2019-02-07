import { joinPaths, URLDescriptor, createURLDescriptor } from './URLTools'
import { MapMatcher } from './MapMatcher'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest'

/**
 * A type that covers all Segment objects.
 */
export type Segment =
  | BusySegment
  | MapSegment
  | ErrorSegment
  | RedirectSegment
  | ContentSegment

export type SegmentType =
  | 'error'
  | 'content'
  | 'busy'
  | 'redirect'
  | 'map'

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
}


/**
 * This is used in place of a segment of another type whose final result is
 * not yet known.
 */
export interface BusySegment extends GenericSegment {
  type: 'busy'
}

/**
 * When encountered in a route by a `<NavContent>`, this will be thrown, and
 * can then be handled by an Error Boundary. Behavior for handling error
 * segments on the server side is undefined.
 */
export interface ErrorSegment extends GenericSegment {
  type: 'error'
  error: any
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
 * Payload segments contain data that will be used in a response on the
 * server, or that will be rendered in the browser. They can contain error
 * or redirect information, but they'll still be rendered as-is in the client.
 */
export interface ContentSegment<C=Content> extends GenericSegment {
  type: 'content'
  content: C
}

export interface Content<Info extends object=any> {
  body?: any
  head?: any
  headers?: { [name: string]: string }
  info?: Info
  status?: number
  title?: string
}

/**
 * Map segments are added for each map that is routed through. They're
 * useful for building maps, as they hold metadata on other possible paths.
 */
export interface MapSegment extends GenericSegment {
  type: 'map'
  map: MapMatcher
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
  error: any,
  ensureTrailingSlash = true,
): BusySegment | ErrorSegment {
  if (error) {
    return createSegment('error', request, { error }, ensureTrailingSlash)  
  }
  return createSegment('busy', request, undefined, ensureTrailingSlash)
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
