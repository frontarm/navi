import { Resolvable } from '../Resolver'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withData<Context extends object, Data>(
  maybeResolvableData: Data | Resolvable<Data, Context>,
  child?: Matcher<Context>,
): Matcher<Context> {
  let getData: Resolvable<Data, Context> =
    typeof maybeResolvableData === 'function'
      ? (maybeResolvableData as any)
      : () => maybeResolvableData

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    let resolution = resolver.resolve(env, getData)
    let { status, value: data } = resolution
    return (
      status === 'ready'
        ? (data ? [createSegment('data', env.request, { data })] : [])
        : [createNotReadySegment(env.request, resolution)]
    )
  }, child)
}
