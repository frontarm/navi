import { Resolvable } from '../Resolvable'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'
import { Matcher } from '../Matcher'

export function withView<Context extends object, View>(
  maybeResolvableView: View | Resolvable<View, Context>,
  child?: Matcher<Context>,
  exact?: boolean,
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableView,
    child,
    ((view, request) => view ? [createChunk('view', request, { view })] : []),
    exact,
    false,
    (request) => request.method !== 'HEAD'
  )
}
