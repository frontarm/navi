import { Router } from './Router'

export interface NaviRequest {
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
   * A Router object, which can be used to make further requests.
   */
  readonly router: Router<any, any>

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
   * The original HTTP method -- useful for checking if this was originally a
   * POST/PATCH/PUT/DELETE action that's been changed to get due to navigation.
   */
  readonly originalMethod?: string

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

  // TODO: these are deprecated, remove in Navi 0.12
  readonly mountname?: string
  readonly pathname?: string
  readonly context?: any
}

export function createRequest(context: any, request: NaviRequest) {
  Object.defineProperties(request, {
    mountname: {
      get: () => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.warn(`Deprecation Warning: "request.mountname" will be removed in Navi 0.12. Please use "request.mountpath" instead.`)
        // }
        return request.mountpath
      },
    },
    pathname: {
      get: () => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.warn(`Deprecation Warning: "request.pathname" will be removed in Navi 0.12. Please use "request.mountpath" instead.`)
        // }
        return request.mountpath
      }
    },
    context: {
      get: () => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.warn(`Deprecation Warning: "request.context" will be removed in Navi 0.12. Please use the separate context argument instead.`)
        // }
        return context
      }
    },
  })
  return request
}