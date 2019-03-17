import resolveChunks, { Resolvable } from '../Resolvable'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  createMatcherIterator,
  concatMatcherIterators,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'
import { Chunk, createChunk } from '../Chunks'

export function withState<Context extends object = any, State extends object = any>(
  stateMaybeResolvable:
    | State
    | Resolvable<State, Context>,
  forceChild?: Matcher<Context>,
): Matcher<Context> {
  if (process.env.NODE_ENV !== 'production') {
    if (stateMaybeResolvable === undefined) {
      console.warn(
        `The first argument to withState() should be the state resolver function, but it was undefined.`,
      )
    }
  }

  function* stateMatcherGenerator(
    request: NaviRequest<Context>,
    child: MatcherGenerator<Context>
  ): MatcherIterator {
    yield* resolveChunks(
      stateMaybeResolvable,
      request,
      mergeState => {
        let state = mergeState === null ? request.state : {
          ...request.state,
          ...mergeState
        }

        return concatMatcherIterators(
          chunks(mergeState === null ? [] : [createChunk('state', request, { state })]),
          createMatcherIterator(
            child,
            {
              ...request,
              state,
            },
          )
        )
      }
    )
  }

  return (child: MatcherGenerator<Context>) => (request: NaviRequest) =>
    stateMatcherGenerator(request, forceChild ? forceChild(child) : child)
}

function* chunks(chunks: Chunk[]) {
  yield chunks
  return
}
