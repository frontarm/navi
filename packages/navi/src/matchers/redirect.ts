import { createSegment, Segment, createNotFoundSegment } from '../Segments'
import { Resolvable } from '../Resolvable'
import { Matcher } from '../Matcher'
import { URLDescriptor, joinPaths, createURLDescriptor } from '../URLTools'
import { createSegmentsMatcher } from '../createSegmentsMatcher'

export function redirect<Context extends object = any>(
  maybeResolvableTo: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>
): Matcher<Context> {
  return createSegmentsMatcher(
    maybeResolvableTo,
    undefined,
    (to, request) => {
      let unmatchedPathnamePart = request.path
      if (unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
        return [createNotFoundSegment(request)]
      }

      // TODO: support all relative URLs
      let toHref: string | undefined
      if (typeof to === 'string') {
        if (to.slice(0, 2) === './') {
          toHref = joinPaths(request.mountpath.split('/').slice(0, -1).join('/'), to.slice(2))
        }
        else {
          toHref = to
        }
      }
      else if (to) {
        toHref = createURLDescriptor(to).href
      }
      return toHref ? [createSegment('redirect', request, { to: toHref })] as Segment[] : []
    },
  )
}
