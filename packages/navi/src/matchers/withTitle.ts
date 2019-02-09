import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment } from '../Segments'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withTitle<Context extends object>(
  maybeResolvableTitle: string | undefined | Resolvable<string | undefined, Context>,
): Matcher<Context> {
  let getTitle: Resolvable<string, Context> =
    typeof maybeResolvableTitle === 'function'
      ? (maybeResolvableTitle as any)
      : () => maybeResolvableTitle

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    let resolution = resolver.resolve(env, getTitle)
    let { status, value: title } = resolution
    return (
      status === 'ready'
        ? (title ? [createSegment('title', env.request, { title })] : [])
        : [createNotReadySegment(env.request, resolution)]
    )
  })
}
