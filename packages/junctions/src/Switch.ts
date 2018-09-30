import {
  Resolution,
  Resolvable,
  undefinedResolvable,
  reduceStatuses,
} from './Resolver'
import {
  Segment,
  SwitchSegment,
  SegmentType,
  createSegment,
  createPlaceholderSegment,
  createNotFoundSegment,
} from './Segments'
import {
  createMapping,
  Mapping,
  matchMappingAgainstPathname,
} from './Mapping'
import {
  NodeMatcher,
  NodeMatcherResult,
  NaviNode,
  NaviNodeType,
  NaviNodeBase,
  MaybeResolvableNode,
  ResolvableNode,
  NodeMatcherOptions,
} from './Node'

export type SwitchPaths<Context extends object> = {
  [pattern: string]: MaybeResolvableNode<Context>
}

export interface Switch<Context extends object = any, Meta extends object = any, Content = any>
  extends NaviNodeBase<Context, SwitchMatcher<Context, Meta, Content>> {
  type: NaviNodeType.Switch

  new (options: NodeMatcherOptions<Context>): SwitchMatcher<
    Context,
    Meta,
    Content
  >

  meta: Resolvable<Meta, Context>
  getContent: Resolvable<Content | undefined, Context>
  paths: SwitchPaths<Context>
  mappings: Mapping[]
  patterns: string[]
}

export class SwitchMatcher<Context extends object, Meta extends object, Content> extends NodeMatcher<Context> {
  static isNode = true
  static type: NaviNodeType.Switch = NaviNodeType.Switch

  child?: {
    mapping: Mapping,
    matcherOptions: NodeMatcherOptions<Context>
    maybeResolvableNode: MaybeResolvableNode<NaviNode>
  }

  last?: {
    matcher?: NodeMatcher<any>
    node?: NaviNode
  };

  ['constructor']: Switch<Context, Meta, Content>
  constructor(options: NodeMatcherOptions<Context>) {
    super(options, true)

    // Start from the beginning and take the first result, as child mounts
    // are sorted such that the first matching mount is the the most
    // precise match (and we always want to use the most precise match).
    let mappings = this.constructor.mappings
    for (let i = mappings.length - 1; i >= 0; i--) {
      let mapping = mappings[i]
      let childEnv = matchMappingAgainstPathname(this.env, mapping, this.appendFinalSlash)
      if (childEnv) {
        this.child = {
          mapping,
          matcherOptions: {
            env: childEnv,
            resolver: this.resolver,
            withContent: this.withContent,
            appendFinalSlash: this.appendFinalSlash,
          },
          maybeResolvableNode: mapping.maybeResolvableNode,
        }

        // The first match is always the only match, as we don't allow
        // for ambiguous patterns.
        break
      }
    }
  }

  protected execute(): NodeMatcherResult<SwitchSegment<Meta, Content>> {
    let hasContent = this.withContent && this.constructor.getContent
    let contentResolvable: Resolvable<Content | undefined> = hasContent
      ? this.constructor.getContent!
      : undefinedResolvable
    let contentResolution = this.resolver.resolve(this.env, contentResolvable)
    let { value: content, status, error } = contentResolution
    
    let metaResolution = this.resolver.resolve(this.env, this.constructor.meta)
    let meta = metaResolution.value
    status = reduceStatuses(status, metaResolution.status)
    error = error || metaResolution.error

    let resolutionIds: number[] = [contentResolution.id, metaResolution.id]
    let childMatcher: NodeMatcher<any> | undefined
    let childNodeResolution: Resolution<NaviNode> | undefined
    if (this.child) {
      let childNode: NaviNode | undefined
      if (this.child.maybeResolvableNode.isNode) {
        childNode = this.child.maybeResolvableNode
      } else {
        childNodeResolution = this.resolver.resolve(
          this.env,
          this.child.maybeResolvableNode as ResolvableNode<NaviNode>,
        )
        resolutionIds.push(childNodeResolution.id)
        childNode = childNodeResolution.value
      }

      if (!this.last || this.last.node !== childNode) {
        if (childNode) {
          childMatcher = new childNode(this.child.matcherOptions)
        }
      } else {
        childMatcher = this.last.matcher
      }

      this.last = {
        node: childNode,
        matcher: childMatcher,
      }
    }

    let childMatcherResult: NodeMatcherResult | undefined
    if (childMatcher) {
      childMatcherResult = childMatcher.getResult()
    }

    let nextSegment: Segment | undefined
    if (childMatcherResult) {
      nextSegment = childMatcherResult && childMatcherResult.segment
    }
    else if (childNodeResolution) {
      nextSegment = createPlaceholderSegment(
        this.child!.matcherOptions.env, 
        childNodeResolution.error
      )
    }
    else if (this.env.unmatchedPathnamePart) {
      nextSegment = createNotFoundSegment(this.env)
    }
    else {
      // We've matched the switch exactly, and don't need to match
      // any child segments - which is useful for creating maps.
    }

    let remainingSegments: Segment[] = []
    if (nextSegment) {
      remainingSegments = nextSegment.type === SegmentType.Switch
        ? [nextSegment as Segment].concat(nextSegment.remainingSegments)
        : [nextSegment]
    }

    // Only create a new segment if necessary, to allow for reference-equality
    // based comparisons on segments
    return {
      resolutionIds: resolutionIds.concat(childMatcherResult ? childMatcherResult.resolutionIds : []),
      segment: createSegment(SegmentType.Switch, this.env, {
        status,
        error,
        content,
        meta: meta || {},
        switch: this.constructor,
        nextPattern: this.child && this.child.mapping.pattern,
        nextSegment,
        lastRemainingSegment: remainingSegments[remainingSegments.length - 1],
        remainingSegments,
      }),
    }
  }
}

export function createSwitch<Context extends object, Meta extends object, Content>(options: {
  paths: SwitchPaths<Context>
  meta?: Meta | Resolvable<Meta>
  getContent?: Resolvable<Content, Context>
}): Switch<Context, Meta, Content> {
  if (!options) {
    throw new Error(
      `createSwitch() was supplied a function that doesn't return any value!`,
    )
  }
  if (!options.paths) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `createSwitch() was called without a "children" option, but a switch without children doesn't make any sense!`,
      )
    }
    options.paths = {} as any
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = Object.keys(options.paths)
    .map(pattern => createMapping(pattern, options.paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  if (process.env.NODE_ENV !== 'production') {
    let { paths, meta, getContent, ...other } = options

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
            (previousPattern.maybeResolvableNode.isNode &&
              previousPattern.maybeResolvableNode.type ===
              NaviNodeType.Switch) ||
            (pattern.maybeResolvableNode.isNode &&
              pattern.maybeResolvableNode.type === NaviNodeType.Switch)
          )
            console.warn(
              `createSwitch() received Switchs for patterns "${
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
      if (!mappings[i].maybeResolvableNode) {
        let pattern = mappings[i].pattern
        console.warn(
          `createSwitch() received "${typeof mappings[i]
            .maybeResolvableNode}" for pattern "${pattern}"!`,
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
        indexPattern.maybeResolvableNode.isNode &&
        indexPattern.maybeResolvableNode.type === NaviNodeType.Switch
      ) {
        console.warn(
          `createSwitch() received a Switch at the "/" pattern, but "/" must be a Page or a Redirect!`,
        )
      }
    }
  }

  return class extends SwitchMatcher<Context, Meta, Content> {
    static paths = options.paths
    static meta = typeof options.meta === 'function' ? options.meta : (() => options.meta  as any)
    static mappings = mappings
    static patterns = mappings.map(mapping => mapping.pattern)
    static getContent = options.getContent || undefinedResolvable
  }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
