import { Router } from './Router'
import { Crawler } from './Crawler';

export interface NaviRequest<Context extends object=any> {
  /**
   * The path at which the matcher is mounted.
   */
  readonly mountpath: string

  /**
   * The values of any URL parameters matched from parameter segments in the
   * URLs, pathname, along with information from the URL's query string.
   */
  readonly params: { [name: string]: string }

  /**
   * An object containing the information from the URL's query string.
   */
  readonly query: { [name: string]: string }

  /**
   * The raw URL query string, including the "?" character. E.g. "?q=test".
   */
  readonly search: string

  /**
   * A HTTP method as an uppercase string. This defaults to "GET".
   */
  readonly method: string

  /**
   * Contains the unmatched part of the request URL.
   */
  readonly path: string

  /**
   * Contains the unmatched part of the request URL, as a string.
   * 
   * This is a string instead of a URLDescriptor, to be consistent
   * with the Request type for Express.
   */
  readonly url: string

  /**
   * The originally requested URL, before any changes applied by matchers.
   */
  readonly originalUrl: string

  readonly body: any
  readonly hostname: string
  readonly headers: { [name: string]: string }

  /**
   * Set to true if this request is being used to build an index.
   */
  readonly crawler?: Crawler

  /**
   * Contains any state associated with the request's history entry.
   */
  readonly state: any

  /**
   * The current routing context
   */
  readonly context: Context

  // TODO: these are deprecated, remove in Navi 0.13
  readonly mountname?: string
  readonly pathname?: string
  readonly router: Router<any>
}

export function createRequest<Context extends object=any>(request: NaviRequest<Context>, router?: Router) {
  return request
}
