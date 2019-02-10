import { Resolution } from '../Resolver'
import {
  Segment,
  createSegment,
  createNotFoundSegment,
  createNotReadySegment,
} from '../Segments'
import { createMapping, mappingAgainstPathname } from '../Mapping'
import {
  Matcher,
  MatcherIterator,
  MaybeResolvableMatcher,
  ResolvableMatcher,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export type MapPaths<Context extends object> = {
  [pattern: string]: MaybeResolvableMatcher<Context>
}

export function map<Context extends object, M extends Matcher<Context>>(
  options: MapPaths<Context> | ResolvableMatcher<Context, M>,
): Matcher<Context> {
  if (!options) {
    throw new Error(`match() must be supplied with a paths object.`)
  }

  let paths: MapPaths<Context>
  if (typeof options === 'function') {
    paths = {
      '/': options,
    }
  } else {
    paths = options
  }

  let patterns = Object.keys(paths)
  let invalidPaths = patterns.filter(
    pattern => typeof paths[pattern] !== 'function',
  )
  if (invalidPaths.length > 0) {
    let singular = invalidPaths.length === 1
    throw new TypeError(
      `The given ${singular ? 'path' : 'paths'}: ${invalidPaths.join(', ')} ${
        singular ? 'is' : 'are'
      } ` +
        `invalid. Paths should be a matcher object or function that returns one. See https://frontarm.com/navi/reference/declarations/`,
    )
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = patterns
    .map(pattern => createMapping(pattern, paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  if (process.env.NODE_ENV !== 'production') {
    // Check to make sure that none of the paths supplied as patterns
    // may intefere with each other.
    let len = mappings.length
    if (mappings.length >= 2) {
      let previousPattern = mappings[len - 1]
      for (let i = len - 2; i >= 0; i--) {
        let pattern = mappings[i]

        // If previous pattern matches this one, and doesn't completely
        // replace it, and either item is a map, then there could
        // be a conflict.
        // TODO: this warning will have false positives when a wildcard
        // is on a view matcher and the map is on a more specific element.
        let replacedKey = pattern.key.replace(previousPattern.regExp, '')
        if (replacedKey !== pattern.key && replacedKey.length > 0) {
          if (
            isValidMapMatcher(previousPattern.maybeResolvableMatcher) ||
            isValidMapMatcher(pattern.maybeResolvableMatcher)
          )
            console.warn(
              `map() received Maps for patterns "${
                previousPattern.pattern
              }" and "${
                pattern.pattern
              }", but this may lead to multiple routes sharing the same URL.`,
            )
        }

        previousPattern = pattern
      }
    }

    // Check for missing mountables on patterns
    for (let i = 0; i < len; i++) {
      if (!mappings[i].maybeResolvableMatcher) {
        let pattern = mappings[i].pattern
        console.warn(
          `map() received "${typeof mappings[i]
            .maybeResolvableMatcher}" for pattern "${pattern}"!`,
        )
      }
    }
  }

  function* mapMatcherGenerator(
    options: MatcherOptions<Context>,
  ): MatcherIterator {
    let { appendFinalSlash, env, resolver } = options
    let child:
      | undefined
      | {
          matcherOptions: MatcherOptions<Context>
          maybeResolvableMatcher: MaybeResolvableMatcher<Context>
        }

    // Start from the beginning and take the first result, as child mounts
    // are sorted such that the first matching mount is the the most
    // precise match (and we always want to use the most precise match).
    if (mappings.length == 1 && mappings[0].pattern === '/') {
      // When there's just one `/` mapping, treat it as a special case of
      // manually mapping based on req or context.
      child = {
        matcherOptions: options,
        maybeResolvableMatcher: mappings[0].maybeResolvableMatcher,
      }
    } else {
      for (let i = mappings.length - 1; i >= 0; i--) {
        let mapping = mappings[i]
        let childEnv = mappingAgainstPathname(env, mapping, !!appendFinalSlash)
        if (childEnv) {
          child = {
            matcherOptions: {
              env: childEnv,
              resolver,
              appendFinalSlash,
            },
            maybeResolvableMatcher: mapping.maybeResolvableMatcher,
          }

          // The first match is always the only match, as we don't allow
          // for ambiguous patterns.
          break
        }
      }
    }

    let childIterator: MatcherIterator | undefined
    let childResult: IteratorResult<Segment[]> | undefined
    let segments: Segment[]
    do {
      let childMatcherResolution: Resolution<Matcher<Context>> | undefined
      if (child && !childIterator) {
        let childMatcher: Matcher<Context> | undefined
        if (child.maybeResolvableMatcher.isMatcher) {
          childMatcher = child.maybeResolvableMatcher
        } else {
          childMatcherResolution = resolver.resolve(
            child.matcherOptions.env,
            child.maybeResolvableMatcher as ResolvableMatcher<
              Context,
              Matcher<Context>
            >,
          )
          childMatcher = childMatcherResolution.value
        }
        if (childMatcher) {
          childIterator = childMatcher()(child.matcherOptions)
        }
      }

      if (childIterator && (!childResult || !childResult.done)) {
        childResult = childIterator.next()
      }

      segments = [
        createSegment('map', env.request, { patterns }, appendFinalSlash),
      ]

      let childSegments = childResult && childResult.value
      if (childSegments) {
        segments = segments.concat(
          childSegments.length
            ? childSegments
            : createSegment('null', env.request),
        )
      } else if (childMatcherResolution) {
        segments.push(
          createNotReadySegment(
            child!.matcherOptions.env.request,
            childMatcherResolution,
            appendFinalSlash,
          ),
        )
      } else if (env.request.path) {
        segments.push(createNotFoundSegment(env.request))
      } else {
        // We've matched the map exactly, and don't need to match
        // any child segments - which is useful for creating maps.
      }

      yield segments
    } while (segments.filter(isBusy).length)
  }

  let matcher = Object.assign(createMatcher(() => mapMatcherGenerator), {
    isMapMatcher: true,
  })

  return matcher
}

function isValidMapMatcher(x: any): boolean {
  return x && x.isMapMatcher
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function isBusy(segment: Segment) {
  return segment.type === 'busy'
}

function isError(segment: Segment) {
  return segment.type === 'error'
}
