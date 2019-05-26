import { Chunk } from './Chunks'
import { URLDescriptor } from './URLTools'

export type RouteType =
  | 'busy'
  | 'ready'
  | 'error'
  | 'redirect'

export interface Route<Data = any> {
  type: RouteType
  url: URLDescriptor
  method: string
  chunks: Chunk[]
  lastChunk: Chunk
  
  /**
   * When "type" is "redirect", contains the redirected to URL.
   */
  to?: string

  /**
   * When "type" is "error", contains the error object.
   */
  error?: any

  /**
   * An object containing merged values from all data chunks.
   */
  data?: Data

  /**
   * An object contains HTTP headers added by header chunks. 
   */
  headers: { [name: string]: string }

  /**
   * An array containing information meant to be added to the page <head>.
   */
  heads: any[]

  /**
   * Any state from window.history.state that was used associated with the
   * route.
   */
  state?: any

  /**
   * A HTTP status code.
   */
  status?: number

  /**
   * The title that should be set on `document.title`.
   */
  title?: string

  /**
   * An array of components or elements for rendering the route's view.
   */
  views: any[]

  // deprecated
  meta?: any
  content?: any
}

export function routeReducer(route: Route | undefined, chunk: Chunk): Route {
  route = routeReducerWithoutCompat(route, chunk)
  Object.defineProperties(route, {
    meta: {
      configurable: true,
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "route.meta" will be removed in Navi 0.13. Please use "route.data" instead.`)
        }
        return route!.data
      },
    },
    content: {
      configurable: true,
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.13. Please use "route.views" instead.`)
        }
        return chunk.view
      },
    },
    segments: {
      configurable: true,
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.13. Please use "route.views" instead.`)
        }
        return route!.chunks
      },
    },
    lastSegment: {
      configurable: true,
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.13. Please use "route.views" instead.`)
        }
        return route!.lastChunk
      },
    }
  })
  return route
}

function routeReducerWithoutCompat(route: Route | undefined, chunk: Chunk): Route {
  if (route) {
    if (chunk.type === 'url') {
      return {
        ...route,
        chunks: route.chunks.filter(chunk => chunk.type !== 'url'),
        url: chunk.url,
      }
    }
    if (route.type !== 'ready') {
      return route
    }
  }

  let base = {
    lastChunk: chunk,
    method: (chunk.request && chunk.request.method)!,
    chunks: route ? route.chunks.concat(chunk) : [chunk],
    
    data: route ? route.data : {},
    headers: route ? route.headers : {},
    heads: route ? route.heads : [],
    state: route ? route.state : {},
    status: route ? route.status : 200,
    title: route && route.title,
    url: route ? route.url : chunk.url,
    views: route ? route.views : [],
  }
  
  switch (chunk.type) {
    case 'busy':
      return { ...base, type: 'busy' }
    case 'data':
      return {
        ...base,
        type: 'ready',
        data: { ...base.data, ...chunk.data }
      }
    case 'error':
      return {
        ...base,
        type: 'error',
        error: chunk.error,
        status: (base.status && base.status >= 400) ? base.status : (chunk.error.status || 500),
      }
    case 'head':
      return {
        ...base,
        type: 'ready',
        heads: base.heads.concat(chunk.head)
      }
    case 'headers':
      return {
        ...base,
        type: 'ready',
        headers: { ...base.headers, ...chunk.headers }
      }
    case 'redirect':
      return { ...base, type: 'redirect', to: chunk.to }
    case 'state':
      return {
        ...base,
        type: 'ready',
        state: { ...base.state, ...chunk.state }
      }
    case 'status':
      return { ...base, type: 'ready', status: chunk.status }
    case 'title':
      return { ...base, type: 'ready', title: chunk.title }
    case 'view':
      return {
        ...base,
        type: 'ready',
        views: base.views.concat(chunk.view),
      }
    default:
      return { ...base, type: 'ready' }
  }
}
