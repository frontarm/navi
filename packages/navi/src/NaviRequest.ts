import { Router } from './Router'

export type HTTPMethod =
  | 'POST'
  | 'GET'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export interface NaviRequest {
  readonly mountpath: string
  readonly params: { [name: string]: string }
  readonly router: Router

  readonly query: { [name: string]: string }
  readonly search: string

  readonly body: any
  readonly hostname: string
  readonly headers: { [name: string]: string }
  readonly method: HTTPMethod

  /**
   * Contains the unmatched part of the query
   */
  readonly path: string
  readonly url: string

  readonly originalUrl: string

  // TODO: these are deprecated, remove in Navi 0.12
  readonly mountname?: string
  readonly pathname?: string
  readonly context?: any
}

export function createRequest(context: any, request: NaviRequest) {
  Object.defineProperties(request, {
    mountname: {
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "request.mountname" will be removed in Navi 0.12. Please use "request.mountpath" instead.`)
        }
        return request.mountpath
      },
    },
    pathname: {
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "request.pathname" will be removed in Navi 0.12. Please use "request.mountpath" instead.`)
        }
        return request.mountpath
      }
    },
    context: {
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "request.context" will be removed in Navi 0.12. Please use the separate context argument instead.`)
        }
        return context
      }
    },
  })
  return request
}