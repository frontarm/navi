import { createSegment, Segment, createNotFoundSegment } from '../Segments'
import resolve, { Resolvable } from '../resolve'
import { Matcher, MatcherOptions, MatcherIterator } from '../Matcher'
import { URLDescriptor, joinPaths, createURLDescriptor } from '../URLTools'

export function redirect<Context extends object = any>(
  maybeResolvableTo: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>
): Matcher<Context> {
  let getTo: Resolvable<Partial<URLDescriptor> | string, Context> =
    typeof maybeResolvableTo === 'function'
      ? (maybeResolvableTo as Resolvable<Partial<URLDescriptor> | string>)
      : () => maybeResolvableTo

  return () => function* redirectMatcherGenerator(
    options: MatcherOptions<Context>,
  ): MatcherIterator {
    yield* resolve(
      getTo,
      options.env.request,
      options.env.context,
      to => {
        let unmatchedPathnamePart = options.env.request.path
        if (unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
          return [createNotFoundSegment(options.env.request)]
        }

        // TODO: support all relative URLs
        let toHref: string | undefined
        if (typeof to === 'string') {
          if (to.slice(0, 2) === './') {
            toHref = joinPaths(options.env.request.mountpath.split('/').slice(0, -1).join('/'), to.slice(2))
          }
          else {
            toHref = to
          }
        }
        else if (to) {
          toHref = createURLDescriptor(to).href
        }
        return toHref ? [createSegment('redirect', options.env.request, { to: toHref })] as Segment[] : []
      },
    )
  }
}
