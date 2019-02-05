import {
  Resolution,
  Resolvable,
  Status,
  reduceStatuses,
} from './Resolver'
import {
  RouteSegment,
  SwitchSegment,
  createRouteSegment,
  createPlaceholderSegment,
  createNotFoundSegment,
} from './Segments'
import {
  createMapping,
  Mapping,
  matchMappingAgainstPathname,
} from './Mapping'
import {
  MatcherBase,
  MatcherResult,
  Matcher,
  MatcherClass,
  MaybeResolvableMatcher,
  ResolvableMatcher,
  MatcherOptions,
} from './Matcher'

export type SwitchPaths<Context extends object> = {
  [pattern: string]: MaybeResolvableMatcher<Context>
}

export interface Switch<Context extends object = any, Info extends object = any, Content = any>
  extends MatcherClass<Context, SwitchMatcher<Context, Info, Content>> {
  type: 'switch'

  new (options: MatcherOptions<Context>): SwitchMatcher<
    Context,
    Info,
    Content
  >

  info?: Info
  getInfo?: Resolvable<Info, Context>
  title?: string
  getTitle?: Resolvable<string, Context, Info>
  head?: string | any[] | JSX.Element
  getHead?: Resolvable<string | any[] | JSX.Element, Context, Info>
  content?: Content
  getContent?: Resolvable<Content, Context, Info>

  paths: SwitchPaths<Context>
  orderedMappings: Mapping[]
  patterns: string[]
}

export class SwitchMatcher<Context extends object, Info extends object, Content> extends MatcherBase<Context> {
  static isMatcher = true
  static type: 'switch' = 'switch'

  child?: {
    mapping: Mapping,
    matcherOptions: MatcherOptions<Context>
    maybeResolvableMatcher: MaybeResolvableMatcher<Matcher>
  }

  last?: {
    matcherInstance?: MatcherBase<any>
    matcher?: Matcher
  };

  ['constructor']: Switch<Context, Info, Content>
  constructor(options: MatcherOptions<Context>) {
    super(options, true)

    // Start from the beginning and take the first result, as child mounts
    // are sorted such that the first matching mount is the the most
    // precise match (and we always want to use the most precise match).
    let mappings = this.constructor.orderedMappings
    for (let i = mappings.length - 1; i >= 0; i--) {
      let mapping = mappings[i]
      let childEnv = matchMappingAgainstPathname(this.env, mapping, this.appendFinalSlash)
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

  protected execute(): MatcherResult {
    let resolutionIds: number[] = []
    let status: Status = 'ready'
    let error: any
    
    // Info must come first, as the promise to its result can be used by
    // the subsequent resolvables.
    let info: Info | undefined
    if (this.constructor.getInfo) {
      let infoResolution = this.resolver.resolve(
        this.env,
        this.constructor.getInfo
      )
      resolutionIds.push(infoResolution.id)
      info = infoResolution.value
      status = reduceStatuses(status, infoResolution.status)
      error = error || infoResolution.error
    }
    else {
      info = this.constructor.info
    }

    let head: any | undefined
    if (this.env.request.method !== 'HEAD' && this.constructor.getHead) {
      let headResolution = this.resolver.resolve(
        this.env,
        this.constructor.getHead,
        this.constructor.getInfo,
      )
      resolutionIds.push(headResolution.id)
      head = headResolution.value
      status = reduceStatuses(status, headResolution.status)
      error = error || headResolution.error
    }
    else {
      head = this.constructor.head
    }

    let content: Content | undefined
    if (this.env.request.method !== 'HEAD' && this.constructor.getContent) {
      let contentResolution = this.resolver.resolve(
        this.env,
        this.constructor.getContent,
        this.constructor.getInfo,
      )
      resolutionIds.push(contentResolution.id)
      content = contentResolution.value
      status = reduceStatuses(status, contentResolution.status)
      error = error || contentResolution.error
    }
    else {
      content = this.constructor.content
    }
    
    let title: string | undefined
    if (this.env.request.method !== 'HEAD' && this.constructor.getTitle) {
      let titleResolution = this.resolver.resolve(
        this.env,
        this.constructor.getTitle,
        this.constructor.getInfo,
      )
      resolutionIds.push(titleResolution.id)
      title = titleResolution.value
      status = reduceStatuses(status, titleResolution.status)
      error = error || titleResolution.error
    }
    else {
      title = this.constructor.title
    }

    let childMatcherInstance: MatcherBase<any> | undefined
    let childMatcherResolution: Resolution<Matcher> | undefined
    if (this.child) {
      let childMatcher: Matcher | undefined
      if (this.child.maybeResolvableMatcher.isMatcher) {
        childMatcher = this.child.maybeResolvableMatcher
      } else {
        childMatcherResolution = this.resolver.resolve(
          this.child.matcherOptions.env,
          this.child.maybeResolvableMatcher as ResolvableMatcher<Matcher>,
        )
        resolutionIds.push(childMatcherResolution.id)
        childMatcher = childMatcherResolution.value
      }

      if (!this.last || this.last.matcher !== childMatcher) {
        if (childMatcher) {
          childMatcherInstance = new childMatcher(this.child.matcherOptions)
        }
      } else {
        childMatcherInstance = this.last.matcherInstance
      }

      this.last = {
        matcher: childMatcher,
        matcherInstance: childMatcherInstance,
      }
    }

    let childMatcherResult: MatcherResult | undefined
    if (childMatcherInstance) {
      childMatcherResult = childMatcherInstance.getResult()
    }

    let nextSegments: RouteSegment[] = []
    if (childMatcherResult) {
      nextSegments = childMatcherResult && childMatcherResult.segments
    }
    else if (childMatcherResolution) {
      nextSegments = [createPlaceholderSegment(
        this.child!.matcherOptions.env.request, 
        childMatcherResolution.error,
        this.appendFinalSlash
      )]
    }
    else if (this.env.request.path) {
      nextSegments = [createNotFoundSegment(this.env.request)]
    }
    else {
      // We've matched the switch exactly, and don't need to match
      // any child segments - which is useful for creating maps.
    }

    // Only create a new segment if necessary, to allow for reference-equality
    // based comparisons on segments
    let switchSegment = createRouteSegment('switch', this.env.request, {
      status,
      error,
      content,
      head,
      info: info || {},
      title,
      switch: this.constructor,
      nextPattern: this.child && this.child.mapping.pattern,
    }, this.appendFinalSlash) as RouteSegment

    return {
      resolutionIds: resolutionIds.concat(childMatcherResult ? childMatcherResult.resolutionIds : []),
      segments: [switchSegment].concat(nextSegments),
    }
  }
}

export function createSwitch<Context extends object, Info extends object, Content>(options: {
  paths: SwitchPaths<Context>
  info?: Info
  getInfo?: Resolvable<Info, Context>
  head?: string | any[] | JSX.Element
  getHead?: Resolvable<string | any[] | JSX.Element, Context, Info>
  content?: Content
  getContent?: Resolvable<Content, Context, Info>
  title?: string
  getTitle?: Resolvable<string, Context, Info>

  // deprecated
  meta?: never
  getMeta?: never
}): Switch<Context, Info, Content> {
  if (!options) {
    throw new Error(
      `createSwitch() must be supplied with an options object.`,
    )
  }
  
  if (!options.paths) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `createSwitch() was called without a "paths" option, but "paths" is required.`,
      )
    }
    options.paths = {} as any
  }

  let patterns = Object.keys(options.paths)
  
  let invalidPaths = patterns.filter(
    pattern => typeof options.paths[pattern] !== 'function'
  )
  if (invalidPaths.length > 0) {
    let singular = invalidPaths.length === 1
    throw new TypeError(`The given ${singular ? 'path' : 'paths'}: ${invalidPaths.join(', ')} ${singular ? 'is' : 'are'} invalid. Path should be an instance of Switch, Page, Redirect, Context or a function. See https://frontarm.com/navi/reference/declarations/#declaring-pages`)
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = patterns
    .map(pattern => createMapping(pattern, options.paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  if (process.env.NODE_ENV !== 'production') {
    let {
        paths,
        
        title,
        getTitle,
        info,
        getInfo,
        head,
        getHead,
        meta,
        getMeta,
        content,
        getContent,

        ...other
    } = options

    let unknownKeys = Object.keys(other)
    if (unknownKeys.length) {
      console.warn(
        `createSwitch() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }

    if (mappings.length === 0) {
      console.warn(
        `createSwitch() was called with an empty object {} for "paths". This doesn't make any sense.`,
      )
    }

    // Check to make sure that none of the switch supplied as patterns
    // may intefere with each other.
    let len = mappings.length
    if (mappings.length >= 2) {
      let previousPattern = mappings[len - 1]
      for (let i = len - 2; i >= 0; i--) {
        let pattern = mappings[i]

        // If previous pattern matches this one, and doesn't completely
        // replace it, and either item is a switch, then there could
        // be a conflict.
        // TODO: this warning will have false positives when a wildcard
        // is on a page and the switch is on a more specific element.
        let replacedKey = pattern.key.replace(previousPattern.regExp, '')
        if (replacedKey !== pattern.key && replacedKey.length > 0) {
          if (
            (previousPattern.maybeResolvableMatcher.isMatcher &&
              previousPattern.maybeResolvableMatcher.type ===
              'switch') ||
            (pattern.maybeResolvableMatcher.isMatcher &&
              pattern.maybeResolvableMatcher.type === 'switch')
          )
            console.warn(
              `createSwitch() received Switches for patterns "${
                previousPattern.pattern
              }" and "${
                pattern.pattern
              }", but this may lead to multiple switchs sharing the same URL.`,
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
          `createSwitch() received "${typeof mappings[i]
            .maybeResolvableMatcher}" for pattern "${pattern}"!`,
        )
      }
    }

    // Check that a switch hasn't been supplied at "/", as the switch
    // could interfere with this switch.
    let indexPattern = mappings.find(pattern => pattern.key === '/')
    if (indexPattern) {
      // Note that if we receive a split, we can't check the type, as we
      // won't know it until the split is loaded. But the same rules
      // still apply!
      if (
        indexPattern.maybeResolvableMatcher.isMatcher &&
        indexPattern.maybeResolvableMatcher.type === 'switch'
      ) {
        console.warn(
          `createSwitch() received a Switch at the "/" pattern, but "/" must be a Page or a Redirect!`,
        )
      }
    }
  }

  return class extends SwitchMatcher<Context, Info, Content> {
    static paths = options.paths

    static info = options.info
    static getInfo = options.getInfo
    static head = options.head
    static getHead = options.getHead
    static title = options.title
    static getTitle = options.getTitle
    static content = options.content
    static getContent = options.getContent

    static orderedMappings = mappings
    static patterns = patterns
  }
}

export function isValidSwitch(x: any): x is Switch {
  return x && x.prototype && x.prototype instanceof SwitchMatcher
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
