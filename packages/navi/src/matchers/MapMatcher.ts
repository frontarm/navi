import { Resolution } from '../Resolver'
import {
  Segment,
  createSegment,
  createNotFoundSegment,
  createNotReadySegment,
} from '../Segments'
import { createMapping, Mapping, mappingAgainstPathname } from '../Mapping'
import {
  Matcher,
  MatcherGenerator,
  MatcherGeneratorClass,
  MaybeResolvableMatcher,
  ResolvableMatcher,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export type MapMatcherPaths<Context extends object> = {
  [pattern: string]: MaybeResolvableMatcher<Context>
}

export interface MapMatcherGeneratorClass<Context extends object = any>
  extends MatcherGeneratorClass<Context, MapMatcherGenerator<Context>> {
  new (options: MatcherOptions<Context>): MapMatcherGenerator<Context>

  paths: MapMatcherPaths<Context>
  orderedMappings: Mapping[]
  patterns: string[]
}

class MapMatcherGenerator<Context extends object> extends MatcherGenerator<
  Context
> {
  child?: {
    mapping: Mapping
    matcherOptions: MatcherOptions<Context>
    maybeResolvableMatcher: MaybeResolvableMatcher<Context>
  }

  last?: {
    matcherGenerator?: MatcherGenerator<any>
    childMatcher?: Matcher<Context>
  };

  ['constructor']: MapMatcherGeneratorClass<Context>
  constructor(options: MatcherOptions<Context>) {
    super(options, true)

    // Start from the beginning and take the first result, as child mounts
    // are sorted such that the first matching mount is the the most
    // precise match (and we always want to use the most precise match).
    let mappings = this.constructor.orderedMappings

    if (mappings.length == 1 && mappings[0].pattern === '/') {
      // When there's just one `/` mapping, treat it as a special case of
      // manually mapping based on req or context.
      this.child = {
        mapping: mappings[0],
        matcherOptions: {
          env: this.env,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        },
        maybeResolvableMatcher: mappings[0].maybeResolvableMatcher,
      }
    } else {
      for (let i = mappings.length - 1; i >= 0; i--) {
        let mapping = mappings[i]
        let childEnv = mappingAgainstPathname(
          this.env,
          mapping,
          this.appendFinalSlash,
        )
        if (childEnv) {
          this.child = {
            mapping,
            matcherOptions: {
              env: childEnv,
              resolver: this.resolver,
              appendFinalSlash: this.appendFinalSlash,
            },
            maybeResolvableMatcher: mapping.maybeResolvableMatcher,
          }

          // The first match is always the only match, as we don't allow
          // for ambiguous patterns.
          break
        }
      }
    }
  }

  protected execute() {
    let childMatcherGenerator: MatcherGenerator<any> | undefined
    let childMatcherResolution: Resolution<Matcher<Context>> | undefined
    if (this.child) {
      let childMatcher: Matcher<Context> | undefined
      if (this.child.maybeResolvableMatcher.isMatcher) {
        childMatcher = this.child.maybeResolvableMatcher
      } else {
        childMatcherResolution = this.resolver.resolve(
          this.child.matcherOptions.env,
          this.child.maybeResolvableMatcher as ResolvableMatcher<
            Context,
            Matcher<Context>
          >,
        )
        childMatcher = childMatcherResolution.value
      }

      if (!this.last || this.last.childMatcher !== childMatcher) {
        if (childMatcher) {
          let childMatcherGeneratorClass = childMatcher()
          childMatcherGenerator = new childMatcherGeneratorClass(this.child.matcherOptions)
        }
      } else {
        childMatcherGenerator = this.last.matcherGenerator
      }

      this.last = {
        childMatcher: childMatcher,
        matcherGenerator: childMatcherGenerator,
      }
    }

    let childMatcherResult: Segment[] | undefined
    if (childMatcherGenerator) {
      childMatcherResult = childMatcherGenerator.getResult()
    }

    let nextSegments: Segment[] = []
    if (childMatcherResult) {
      nextSegments = childMatcherResult
    } else if (childMatcherResolution) {
      nextSegments = [
        createNotReadySegment(
          this.child!.matcherOptions.env.request,
          childMatcherResolution,
          this.appendFinalSlash,
        ),
      ]
    } else if (this.env.request.path) {
      nextSegments = [createNotFoundSegment(this.env.request)]
    } else {
      // We've matched the map exactly, and don't need to match
      // any child segments - which is useful for creating maps.
    }

    // Only create a new segment if necessary, to allow for reference-equality
    // based comparisons on segments
    let mapSegment = createSegment(
      'map',
      this.env.request,
      { map: this.constructor },
      this.appendFinalSlash,
    ) as Segment

    return [mapSegment].concat(nextSegments)
  }
}

export function map<Context extends object, M extends Matcher<Context>>(
  options: MapMatcherPaths<Context> | ResolvableMatcher<Context, M>,
): Matcher<Context> {
  if (!options) {
    throw new Error(`match() must be supplied with a paths object.`)
  }

  let paths: MapMatcherPaths<Context>
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

  return createMatcher(() =>
    class extends MapMatcherGenerator<Context> {
      static paths = paths
      static orderedMappings = mappings
      static patterns = patterns
    }
  )
}

function isValidMapMatcher(x: any): x is MapMatcherGeneratorClass {
  return x && x.prototype && x.prototype instanceof MapMatcherGenerator
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
