import { Resolvable } from '../Resolver'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import { createSegment, createNotReadySegment } from '../Segments'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'

export function withView<Context extends object, View>(
  maybeResolvableView: View | Resolvable<View, Context>,
  child?: Matcher<Context>
): Matcher<Context> {
  let getView: Resolvable<View, Context> =
    typeof maybeResolvableView === 'function'
      ? (maybeResolvableView as any)
      : () => maybeResolvableView

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    if (env.request.method !== 'HEAD') {
      let resolution = resolver.resolve(env, getView)
      let { status, value: view } = resolution
      return (
        status === 'ready'
          ? (view ? [createSegment('view', env.request, { view })] : [])
          : [createNotReadySegment(env.request, resolution)]
      )
    }
    else {
      return []
    }
  }, child)
}
