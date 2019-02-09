import { Segment, createNotFoundSegment, createSegment } from '../Segments'
import {
  Matcher,
  MatcherIterator,
  MatcherGenerator,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export function createSegmentsMatcher<Context extends object>(
  getSegments: (options: MatcherOptions<Context>) => Segment[],
): Matcher<Context> {
  function* segmentsMatcherGenerator(
    options: MatcherOptions<Context>,
    child?: MatcherGenerator<Context>,
  ): MatcherIterator {
    let env = options.env
    let unmatchedPathnamePart = env.request.path
    if (!child && unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
      yield [createNotFoundSegment(env.request)]
      return
    }

    let childIterator: MatcherIterator | undefined
    let childResult: IteratorResult<Segment[]> | undefined
    let childSegments: Segment[] = []
    let segments: Segment[]
    do {
      segments = getSegments(options)
      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i]
        if (segment.type === 'error') {
          yield segments
          return
        }
      }

      if (child && !childIterator) {
        childIterator = child(options)
      }
      if (childIterator && (!childResult || !childResult.done)) {
        childResult = childIterator.next()
        if (childResult.value) {
          // It's possible that the children finish before we do, so save
          // they're last value.
          childSegments = childResult.value
        }
      }

      segments = segments.concat(childSegments)
      if (segments.length === 0) {
        segments = [createSegment('null', env.request)]
      }
      yield segments
    } while (segments.filter(isBusy).length)
  }

  return createMatcher((child?: MatcherGenerator<Context>) => options =>
    segmentsMatcherGenerator(options, child),
  )
}

function isBusy(segment: Segment) {
  return segment.type === 'busy'
}
