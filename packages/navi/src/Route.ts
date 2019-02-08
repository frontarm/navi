import { URLDescriptor } from './URLTools'
import { Segment } from './Segments'

export type RouteType =
  | 'busy'
  | 'ready'
  | 'error'
  | 'redirect'

export interface Route<Data = any, View = any> {
  url: URLDescriptor

  type: RouteType
  to?: string
  error?: any

  segments: Segment[]
  lastSegment: Segment

  views?: View
  data?: Data
  title?: string
}

export function defaultRouteReducer(route: Route | undefined, segment: Segment): Route {
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
    url: route ? route.url : segment.url,
    views: route ? route.views : [],
    data: route ? route.data : {},
    segments: route ? route.segments.concat(segment) : [segment],
    lastSegment: segment,
    title: route && route.title,
  }
  
  switch (segment.type) {
    case 'busy':
      return { ...base, type: 'busy' }
    case 'view':
      route = {
        ...base,
        type: 'ready',
        views: base.views.concat(segment.view),
      }
      Object.defineProperty(route, 'content', {
        enumerable: true,
        get: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.12. Please use "route.views" instead.`)
          }
          return segment.view
        },
      })
      return route
    case 'error':
      return { ...base, type: 'error', error: segment.error }
    case 'null':
    case 'url':
    case 'map':
      return { ...base, type: 'ready' }
    case 'title':
      return { ...base, type: 'ready', title: segment.title }
    case 'data':
      Object.assign(base.data, segment.data)
      route = { ...base, type: 'ready', data: base.data }
      Object.defineProperty(route, 'meta', {
        enumerable: true,
        get: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Deprecation Warning: "route.meta" will be removed in Navi 0.12. Please use "route.data" instead.`)
          }
          return route!.data
        },
      })
      return route
    case 'redirect':
      return { ...base, type: 'redirect', to: segment.to }
  }
}
