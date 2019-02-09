import { Resolvable } from '../Resolver'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withStatus<Context extends object>(
  maybeResolvableStatus: number | undefined | Resolvable<number | undefined, Context>,
): Matcher<Context> {
  let getStatus: Resolvable<number, Context> =
    typeof maybeResolvableStatus === 'function'
      ? (maybeResolvableStatus as any)
      : () => maybeResolvableStatus

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    let resolution = resolver.resolve(env, getStatus)
    let { status, value } = resolution
    return (
      status === 'ready'
        ? (value ? [createSegment('status', env.request, { status: value })] : [])
        : [createNotReadySegment(env.request, resolution)]
    )
  })
}
