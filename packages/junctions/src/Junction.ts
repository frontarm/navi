import {
  Resolution,
  Resolvable,
  undefinedResolver,
} from './Resolver'
import {
  Route,
  JunctionRoute,
  RouteType,
  Status,
  PlaceholderRoute,
  createRoute,
  createPlaceholderRoute,
  createNotFoundRoute,
} from './Route'
import { RouterEnv } from './RouterEnv'
import {
  createMapping,
  Mapping,
  matchMappingAgainstPathname,
} from './Mapping'
import {
  NodeMatcher,
  NodeMatcherResult,
  Node,
  NodeBase,
  MaybeResolvableNode,
  ResolvableNode,
  NodeMatcherOptions,
} from './Node'
import { NotFoundError } from './Errors'
import { joinPaths } from './URLTools';

export type JunctionPaths<Context> = {
  [pattern: string]: MaybeResolvableNode<Context>
}

export interface Junction<Meta = any, Content = any, Context = any>
  extends NodeBase<Context, JunctionMatcher<Meta, Content, Context>> {
  type: RouteType.Junction

  new (options: NodeMatcherOptions<Context>): JunctionMatcher<
    Meta,
    Content,
    Context
  >

  meta: Meta
  getContent?: ((env: RouterEnv<Context>) => Content | PromiseLike<Content>)
  paths: JunctionPaths<Context>
  mappings: Mapping[]
  patterns: string[]
}

export class JunctionMatcher<Meta, Content, Context> extends NodeMatcher<Context> {
  static isNode = true
  static type: RouteType.Junction = RouteType.Junction

  child?: {
    mapping: Mapping,
    matcherOptions: NodeMatcherOptions<Context>
    maybeResolvableNode: MaybeResolvableNode<Node>
  }

  last?: {
    matcher?: NodeMatcher<any>
    node?: Node
  };

  ['constructor']: Junction<Meta, Content, Context>
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

  protected execute(): NodeMatcherResult<JunctionRoute<Meta, Content>> {
    let hasContent = this.withContent && this.constructor.getContent
    let contentResolution: Resolution<Content | undefined>
    let contentResolvable: Resolvable<Content | undefined> = hasContent
      ? this.constructor.getContent!
      : undefinedResolver
    contentResolution = this.resolver.resolve(this.env, contentResolvable)
    
    let resolutionIds: number[] = [contentResolution.id]
    let childMatcher: NodeMatcher<any> | undefined
    let childNodeResolution: Resolution<Node> | undefined
    if (this.child) {
      let childNode: Node | undefined
      if (this.child.maybeResolvableNode.isNode) {
        childNode = this.child.maybeResolvableNode
      } else {
        childNodeResolution = this.resolver.resolve(
          this.env,
          this.child.maybeResolvableNode as ResolvableNode<Node>,
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

    let nextRoute: Route | undefined
    if (childMatcherResult) {
      nextRoute = childMatcherResult && childMatcherResult.route
    }
    else if (childNodeResolution) {
      nextRoute = createPlaceholderRoute(
        this.child!.matcherOptions.env, 
        childNodeResolution.error
      )
    }
    else if (this.env.unmatchedPathnamePart) {
      nextRoute = createNotFoundRoute(this.env)
    }
    else {
      // We've matched the junction exactly, and don't need to match
      // any child routes - which is useful for creating maps.
    }

    let remainingRoutes: Route[] = []
    if (nextRoute) {
      remainingRoutes = nextRoute.type === RouteType.Junction
        ? [nextRoute as Route].concat(nextRoute.remainingRoutes)
        : [nextRoute]
    }

    // Only create a new route if necessary, to allow for reference-equality
    // based comparisons on routes
    return {
      resolutionIds: resolutionIds.concat(childMatcherResult ? childMatcherResult.resolutionIds : []),
      route: createRoute(RouteType.Junction, this.env, {
        status: contentResolution.status,
        error: contentResolution.error,
        content: contentResolution.value,
        meta: this.constructor.meta,
        junction: this.constructor,
        nextPattern: this.child && this.child.mapping.pattern,
        nextRoute,
        lastRemainingRoute: remainingRoutes[remainingRoutes.length - 1],
        remainingRoutes,
      }),
    }
  }
}

export function createJunction<Meta, Content, Context>(options: {
  paths: JunctionPaths<Context>
  meta?: Meta
  getContent?: (env: RouterEnv<Context>) => Content | Promise<Content>
}): Junction<Meta, Content, Context> {
  if (!options) {
    throw new Error(
      `createJunction() was supplied a function that doesn't return any value!`,
    )
  }
  if (!options.paths) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `createJunction() was called without a "children" option, but a junction without children doesn't make any sense!`,
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
        `createJunction() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }

    if (mappings.length === 0) {
      console.warn(
        `createJunction() was called with an empty object {} for "paths". This doesn't make any sense.`,
      )
    }

    // Check to make sure that none of the junction supplied as patterns
    // may intefere with each other.
    let len = mappings.length
    if (mappings.length >= 2) {
      let previousPattern = mappings[len - 1]
      for (let i = len - 2; i >= 0; i--) {
        let pattern = mappings[i]

        // If previous pattern matches this one, and doesn't completely
        // replace it, and either item is a junction, then there could
        // be a conflict.
        // TODO: this warning will have false positives when a wildcard
        // is on a page and the junction is on a more specific element.
        let replacedKey = pattern.key.replace(previousPattern.regExp, '')
        if (replacedKey !== pattern.key && replacedKey.length > 0) {
          if (
            (previousPattern.maybeResolvableNode.isNode &&
              previousPattern.maybeResolvableNode.type ===
                RouteType.Junction) ||
            (pattern.maybeResolvableNode.isNode &&
              pattern.maybeResolvableNode.type === RouteType.Junction)
          )
            console.warn(
              `createJunction() received Junctions for patterns "${
                previousPattern.pattern
              }" and "${
                pattern.pattern
              }", but this may lead to multiple junctions sharing the same URL.`,
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
          `createJunction() received "${typeof mappings[i]
            .maybeResolvableNode}" for pattern "${pattern}"!`,
        )
      }
    }

    // Check that a junction hasn't been supplied at "/", as the junction
    // could interfere with this junction.
    let indexPattern = mappings.find(pattern => pattern.key === '/')
    if (indexPattern) {
      // Note that if we receive a split, we can't check the type, as we
      // won't know it until the split is loaded. But the same rules
      // still apply!
      if (
        indexPattern.maybeResolvableNode.isNode &&
        indexPattern.maybeResolvableNode.type === RouteType.Junction
      ) {
        console.warn(
          `createJunction() received a Junction at the "/" pattern, but "/" must be a Page or a Redirect!`,
        )
      }
    }
  }

  return class extends JunctionMatcher<Meta, Content, Context> {
    static paths = options.paths
    static meta = options.meta as Meta
    static mappings = mappings
    static patterns = mappings.map(mapping => mapping.pattern)
    static getContent = options.getContent
  }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
