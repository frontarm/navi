import { Resolvable } from '../Resolver'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withHead<Context extends object, Head>(
  maybeResolvableHead: Head | Resolvable<Head, Context>,
): Matcher<Context> {
  let getHead: Resolvable<Head, Context> =
    typeof maybeResolvableHead === 'function'
      ? (maybeResolvableHead as any)
      : () => maybeResolvableHead

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    if (env.request.method !== 'HEAD') {
      let resolution = resolver.resolve(env, getHead)
      let { status, value: head } = resolution
      return (
        status === 'ready'
          ? (head ? [createSegment('head', env.request, { head })] : [])
          : [createNotReadySegment(env.request, resolution)]
      )
    }
    else {
      return []
    }
  })
}
