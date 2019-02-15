import { URLDescriptor } from './URLTools'
import { Segment } from './Segments'

export type RouteType =
  | 'busy'
  | 'ready'
  | 'error'
  | 'redirect'

export interface Route<Data = any> {
  type: RouteType
  url: URLDescriptor
  segments: Segment[]
  lastSegment: Segment
  
  /**
   * When "type" is "redirect", contains the redirected to URL.
   */
  to?: string

  /**
   * When "type" is "error", contains the error object.
   */
  error?: any

  /**
   * An object containing merged values from all data segments.
   */
  data?: Data

  /**
   * An object contains HTTP headers added by header segments. 
   */
  headers: { [name: string]: string }

  /**
   * An array containing information meant to be added to the page <head>.
   */
  heads: any[]

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

export function defaultRouteReducer(route: Route | undefined, segment: Segment): Route {
  route = defaultRouteReducerWithoutCompat(route, segment)
  Object.defineProperties(route, {
    meta: {
      configurable: true,
      get: () => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.warn(`Deprecation Warning: "route.meta" will be removed in Navi 0.12. Please use "route.data" instead.`)
        // }
        return route!.data
      },
    },
    content: {
      configurable: true,
      get: () => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.12. Please use "route.views" instead.`)
        // }
        return segment.view
      },
    }
  })
  return route
}

function defaultRouteReducerWithoutCompat(route: Route | undefined, segment: Segment): Route {
  if (route) {
    if (segment.type === 'url') {
      return {
        ...route,
        segments: route.segments.filter(segment => segment.type !== 'url'),
        url: segment.url,
      }
    }
    if (route.type !== 'ready') {
      return route
    }
  }

  let base = {
    lastSegment: segment,
    segments: route ? route.segments.concat(segment) : [segment],
    
    data: route ? route.data : {},
    headers: route ? route.headers : {},
    heads: route ? route.heads : [],
    status: route ? route.status : 200,
    title: route && route.title,
    url: route ? route.url : segment.url,
    views: route ? route.views : [],
  }
  
  switch (segment.type) {
    case 'busy':
      return { ...base, type: 'busy' }
    case 'data':
      return {
        ...base,
        type: 'ready',
        data: { ...base.data, ...segment.data }
      }
    case 'error':
      return {
        ...base,
        type: 'error',
        error: segment.error,
        status: (base.status && base.status >= 400) ? base.status : (segment.error.status || 500),
      }
    case 'head':
      return {
        ...base,
        type: 'ready',
        heads: base.heads.concat(segment.head)
      }
    case 'headers':
      return {
        ...base,
        type: 'ready',
        headers: { ...base.headers, ...segment.headers }
      }
    case 'redirect':
      return { ...base, type: 'redirect', to: segment.to }
    case 'status':
      return { ...base, type: 'ready', status: segment.status }
    case 'title':
      return { ...base, type: 'ready', title: segment.title }
    case 'view':
      return {
        ...base,
        type: 'ready',
        views: base.views.concat(segment.view),
      }
    default:
      return { ...base, type: 'ready' }
  }
}
