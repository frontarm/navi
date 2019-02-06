import { URLDescriptor } from './URLTools'
import { Segment, PayloadSegment, Payload } from './Segments'

export type RouteType =
  | 'switch'
  | 'page'
  | 'error'
  | 'redirect'
  | 'busy'

export interface Route {
  url: URLDescriptor

  type: RouteType

  segments: Segment[]
  firstSegment: Segment
  lastSegment: Segment

  to?: string

  error?: any

  title?: any
  info: object
  contents: any[]
  heads: any[]
  status?: number
}

export interface RedirectRoute extends Route {
  type: 'redirect'
  to: string
}

export interface PageRoute<Info extends object = any, Content extends object = any> extends Route {
  type: 'page'
  lastSegment: PayloadSegment<Payload<Info, Content>>

  title: string
  info: Info
}

export function createRoute(url: URLDescriptor, segments: Segment[]): Route {
  let lastSegment = segments[segments.length - 1]
  let error: any
  let info: object = {}
  let contents: any[] = []
  let heads: any[] = []
  let title: string | undefined
  let status: number | undefined
  let to: string | undefined

  // An error could appear in a mid segment if its content fails to load,
  // and we want to always use the first error available.
  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i]
    if (segment.type === 'error') {
      error = segment.error
      break
    }
    if (segment.type === 'redirect') {
      to = segment.to
      break
    }
    if (segment.type === 'busy') {
      break
    }
    if (segment.type === 'payload') {
      let payload = segment.payload as Payload
      if (payload.status) {
        status = parseInt(payload.status as any, 10)
      }
      if (payload.content) {
        contents.push(payload.content)
      }
      if (payload.head !== undefined) {
        heads.push(payload.head)
      }
      if (payload.title) {
        title = payload.title
      }
      Object.assign(info, payload.info)
    }
  }

  let route: Route = {
    type: lastSegment.type === 'payload' ? 'page' : lastSegment.type,
    url: url,
    segments,
    firstSegment: segments[0],
    lastSegment: segments[segments.length - 1],
    error,
    status,
    contents,
    heads,
    info,
    title,
  }

  if (route.type === 'redirect') {
    (route as RedirectRoute).to = to!
  }

  if (route.type === 'page') {
    Object.defineProperty(route, 'content', {
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn("`route.content` is deprecated, and will be removed in Navi 0.12. Please use the `route.contents` array instead.")
        }
        return route.contents[route.contents.length - 1]
      }
    })
  }

  Object.defineProperty(route, 'meta', {
    get: () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("`route.meta` is deprecated, and will be removed in Navi 0.12. Please use `route.info` instead.")
      }
      return route.info
    }
  })

  return route
}
