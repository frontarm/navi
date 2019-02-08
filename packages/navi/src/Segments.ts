import { joinPaths, URLDescriptor, createURLDescriptor } from './URLTools'
import { MapMatcherGeneratorClass } from './matchers/MapMatcher'
import { NotFoundError } from './Errors'
import { NaviRequest } from './NaviRequest'

/**
 * A type that covers all Segment objects.
 */
export type Segment =
  | BusySegment
  | ContentSegment
  | ErrorSegment
  | InfoSegment
  | MapSegment
  | NullSegment
  | RedirectSegment
  | URLSegment

export type SegmentType =
  | 'busy'
  | 'content'
  | 'error'
  | 'info'
  | 'map'
  | 'null'
  | 'redirect'
  | 'url'

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
  content?: any
  map?: any
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
 * Content segments contain data that will be used in a response on the
 * server, or that will be rendered in the browser. They can contain error
 * or redirect information, but they'll still be rendered as-is in the client.
 */
export interface ContentSegment<Content=any> extends GenericSegment {
  type: 'content'
  content: Content
}

/**
 * Info segments contain information that will be available on the produced
 * route object, but isn't meant to be rendered with the page itself.
 */
export interface InfoSegment<Info=any> extends GenericSegment {
  type: 'info'
  info: Info
}

/**
 * Added by matchers that don't add anything else, to make sure that the last
 * segment isn't a map segment when building maps.
 */
export interface NullSegment extends GenericSegment {
  type: 'null'
}

/**
 * Contains the URL's hash, if it exists. This isn't usable within the router,
 * but is appended by BrowserRoute or MemoryRoute if appropriate.
 */
export interface URLSegment extends GenericSegment {
  type: 'url'
}

/**
 * Map segments are added for each map that is routed through. They're
 * useful for building maps, as they hold metadata on other possible paths.
 */
export interface MapSegment extends GenericSegment {
  type: 'map'
  map: MapMatcherGeneratorClass
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
