import { URLDescriptor } from './URLTools'
import { Segment } from './Segments'

export type RouteType =
  | 'busy'
  | 'success'
  | 'error'
  | 'redirect'

export interface Route<Info = any, Content = any> {
  url: URLDescriptor

  type: RouteType
  to?: string
  error?: any

  segments: Segment[]
  lastSegment: Segment

  contents?: Content
  info?: Info
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
    if (route.type !== 'success') {
      return route
    }
  }

  let base = {
    url: route ? route.url : segment.url,
    contents: route ? route.contents : [],
    info: route ? route.info : {},
    segments: route ? route.segments.concat(segment) : [segment],
    lastSegment: segment,
    title: route && route.title,
  }
  
  switch (segment.type) {
    case 'busy':
      return { ...base, type: 'busy' }
    case 'content':
      route = {
        ...base,
        type: 'success',
        contents: base.contents.concat(segment.content),
      }
      Object.defineProperty(route, 'content', {
        enumerable: true,
        get: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.12. Please use "route.contents" instead.`)
          }
          return segment.content
        },
      })
      return route
    case 'error':
      return { ...base, type: 'error', error: segment.error }
    case 'null':
    case 'url':
    case 'map':
      return { ...base, type: 'success' }
    case 'info':
      Object.assign(base.info, segment.info)
      route = { ...base, type: 'success', info: base.info }
      if (base.info.title) {
        route.title = base.info.title
      }
      Object.defineProperty(route, 'meta', {
        enumerable: true,
        get: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Deprecation Warning: "route.meta" will be removed in Navi 0.12. Please use "route.info" instead.`)
          }
          return route!.info
        },
      })
      return route
    case 'redirect':
      return { ...base, type: 'redirect', to: segment.to }
  }
}
