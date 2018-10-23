import { URLDescriptor } from './URLTools'
import { Status } from './Resolver'
import { Segment, SwitchSegment, isSegmentSteady, PlaceholderSegment, SegmentType, PageSegment, RedirectSegment } from './Segments'

export enum RouteType {
  Switch = 'switch',
  Page = 'page',
  Redirect = 'redirect',
  Plaecholder = 'placeholder'
}

export interface Route {
  url: URLDescriptor

  type: RouteType

  segments: Segment[]
  firstSegment: SwitchSegment
  lastSegment: Segment

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

  // Placeholder properties for page/redirect route
  to?: any
  title?: any
  meta?: any
  content?: any
}

export interface PageRoute<Meta extends object = any, Content extends object = any> extends Route {
  type: RouteType.Page
  status: Status.Ready
  isSteady: true
  lastSegment: PageSegment<Meta, Content>

  title: string
  meta: Meta
  content: Content
}

export interface RedirectRoute<Meta extends object = any> extends Route {
  type: RouteType.Redirect
  status: Status.Ready
  isSteady: true
  lastSegment: RedirectSegment<Meta>

  to: string
  meta: Meta
}

export function createRoute(url: URLDescriptor, firstSegment: SwitchSegment | PlaceholderSegment): Route {
  let segments = [firstSegment as Segment].concat(firstSegment.remainingSegments)
  let lastSegment = segments[segments.length - 1]
  let status = lastSegment.status
  let error: any

  // An error could appear in a mid segment if its content fails to load,
  // and we want to always use the first error available.
  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i]
    if (segment.status === Status.Error) {
      error = segment.error
      status = Status.Error
    }
  }

  let route: Route = {
    type: lastSegment.type as string as RouteType,
    url: url,
    segments,
    firstSegment: segments[0] as SwitchSegment,
    lastSegment,
    isSteady: isSegmentSteady(segments[0]),
    error,
    status,
  }

  if (lastSegment.type === SegmentType.Redirect) {
    route.to = lastSegment.to
    route.meta = lastSegment.meta
  }
  if (lastSegment.type === SegmentType.Page) {
    route.title = lastSegment.title
    route.meta = lastSegment.meta
    route.content = lastSegment.content
  }

  return route
}
