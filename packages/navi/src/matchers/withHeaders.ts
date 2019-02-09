import { Resolvable } from '../Resolver'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withHeaders<Context extends object>(
  maybeResolvableHeaders: undefined | { [name: string]: string } | Resolvable<undefined | { [name: string]: string }, Context>,
): Matcher<Context> {
  let getHeaders: Resolvable<{ [name: string]: string }, Context> =
    typeof maybeResolvableHeaders === 'function'
      ? (maybeResolvableHeaders as any)
      : () => maybeResolvableHeaders

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    let resolution = resolver.resolve(env, getHeaders)
    let { status, value: headers } = resolution
    return (
      status === 'ready'
        ? (headers ? [createSegment('headers', env.request, { headers })] : [])
        : [createNotReadySegment(env.request, resolution)]
    )
  })
}
