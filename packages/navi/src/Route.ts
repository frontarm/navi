import { URLDescriptor } from './URLTools'
import { Segment, ContentSegment, Content } from './Segments'

export type RouteType =
  | 'busy'
  | 'content'
  | 'error'
  | 'map'
  | 'redirect'

export interface Route<C = Content> {
  url: URLDescriptor

  type: RouteType

  segments: Segment[]
  firstSegment: Segment
  lastSegment: Segment

  contents: C[]

  to?: string

  error?: any

  title?: any
  info: any
  bodies: any[]
  heads: any[]
  status?: number
}

export interface RedirectRoute extends Route {
  type: 'redirect'
  to: string
}

export interface ContentRoute<Info extends object = any, C = Content<Info>> extends Route {
  type: 'content'
  lastSegment: ContentSegment<C>

  title: string
  info: Info
}

export function createRoute(url: URLDescriptor, segments: Segment[]): Route {
  let lastSegment: Segment = undefined as any
  let contents: any[] = []
  let error: any
  let info: object = {}
  let bodies: any[] = []
  let heads: any[] = []
  let title: string | undefined
  let status: number | undefined
  let to: string | undefined

  // An error could appear in a mid segment if its content fails to load,
  // and we want to always use the first error available.
  for (let i = 0; i < segments.length; i++) {
    lastSegment = segments[i]
    if (lastSegment.type === 'error') {
      error = lastSegment.error
      break
    }
    if (lastSegment.type === 'redirect') {
      to = lastSegment.to
      break
    }
    if (lastSegment.type === 'busy') {
      break
    }
    if (lastSegment.type === 'content') {
      let content = lastSegment.content as Content
      contents.push(content)
      if (content.status) {
        status = parseInt(content.status as any, 10)
      }
      if (content.body) {
        bodies.push(content.body)
      }
      if (content.head !== undefined) {
        heads.push(content.head)
      }
      if (content.title) {
        title = content.title
      }
      Object.assign(info, content.info)
    }
  }

  let route: Route = {
    type: lastSegment.type,
    contents,
    url: url,
    segments,
    firstSegment: segments[0],
    lastSegment: lastSegment,
    error,
    status,
    bodies: bodies,
    heads,
    info,
    title,
  }

  if (route.type === 'redirect') {
    (route as RedirectRoute).to = to!
  }

  if (route.type === 'content') {
    Object.defineProperty(route, 'content', {
      get: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Deprecation Warning: "route.content" will be removed in Navi 0.12. Please use the "route.contents" array instead.`)
        }
        return route.bodies[route.bodies.length - 1]
      }
    })
  }

  Object.defineProperty(route, 'meta', {
    get: () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Deprecation Warning: "route.meta" will be removed in Navi 0.12. Please use "route.info" instead.`)
      }
      return route.info
    }
  })

  return route
}
