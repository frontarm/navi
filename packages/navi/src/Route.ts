import { URLDescriptor } from './URLTools'
import { Status } from './Resolver'
import { RouteSegment, SwitchSegment, isRouteSegmentSteady, PlaceholderSegment, PageSegment, RedirectSegment } from './Segments'

export type RouteType =
  | 'switch'
  | 'page'
  | 'redirect'
  | 'placeholder'

export interface Route {
  url: URLDescriptor

  type: RouteType

  segments: RouteSegment[]
  firstSegment: SwitchSegment
  lastSegment: RouteSegment

  /**
   * Indicates that the router context must be changed to cause any more
   * changes.
   */
  isSteady: boolean

  /**
   * Indicates whether the location has fully loaded (including content if
   * content was requested), is still busy, or encountered an error.
   */
  status: Status

  error?: any

  // Placeholder properties for routes that don't contain them
  to?: any
  title?: any
  info: object
  contents: any[]
  heads: any[]
}

export interface PageRoute<Info extends object = any, Content extends object = any> extends Route {
  type: 'page'
  status: 'ready'
  isSteady: true
  lastSegment: PageSegment<Info, Content>

  title: string
  info: Info
}

export interface RedirectRoute<Info extends object = any> extends Route {
  type: 'redirect'
  status: 'ready'
  isSteady: true
  lastSegment: RedirectSegment<Info>

  to: string
  info: Info
}

export function createRoute(url: URLDescriptor, firstSegment: SwitchSegment | PlaceholderSegment): Route {
  let segments = [firstSegment as RouteSegment].concat(firstSegment.remainingSegments)
  let lastSegment = segments[segments.length - 1]
  let status = lastSegment.status
  let error: any
  let info: object = {}
  let contents: any[] = []
  let heads: any[] = []
  let title: string | undefined

  // An error could appear in a mid segment if its content fails to load,
  // and we want to always use the first error available.
  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i]
    if (segment.status === 'error') {
      error = segment.error
      status = 'error'
    }
    if (segment.content !== undefined) {
      contents.push(segment.content)
    }
    if (segment.head !== undefined) {
      heads.push(segment.head)
    }
    if (segment.title) {
      title = segment.title
    }
    Object.assign(info, segment.info)
  }

  let route: Route = {
    type: lastSegment.type,
    url: url,
    segments,
    firstSegment: segments[0] as SwitchSegment,
    lastSegment,
    isSteady: isRouteSegmentSteady(segments[0]),
    error,
    status,
    contents,
    heads,
    info,
    title,
  }

  if (lastSegment.type === 'redirect') {
    route.to = lastSegment.to
  }

  if (lastSegment.type === 'page') {
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
