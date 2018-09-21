import { Location } from './Location'
import {
  ResolverResult,
  ResolverStatus,
  Resolvable,
  undefinedResolver,
} from './Resolver'
import {
  Route,
  JunctionRoute,
  RouteType,
  RouteStatus,
  RouteContentStatus,
} from './Route'
import { RouterEnv } from './RouterEnv'
import {
  createMapping,
  Mapping,
  createChildMapping,
  matchMappingAgainstLocation,
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

export class JunctionMatcher<Meta, Content, Context> extends NodeMatcher<
  Context
> {
  static isNode = true
  static type: RouteType.Junction = RouteType.Junction

  childMatcherOptions?: NodeMatcherOptions<Context>
  childMaybeResolvableNode?: MaybeResolvableNode<Node>

  last?: {
    resolvables: Resolvable<any>[]
    childMatcher?: NodeMatcher<any>
    childNodeResult?: ResolverResult<Node>
    contentResult: ResolverResult<Content>
    route: JunctionRoute<Meta, Content>
  };

  ['constructor']: Junction<Meta, Content, Context>
  constructor(options: NodeMatcherOptions<Context>) {
    super(options)

    if (this.match) {
      let matchableLocation: Location = this.match.remainingLocation
        ? this.match.remainingLocation
        : { pathname: '/' }

      let mappings = this.constructor.mappings

      // Start from the beginning and take the first result, as child mounts
      // are sorted such that the first matching mount is the the most
      // precise match (and we always want to use the most precise match).
      for (let i = mappings.length - 1; i >= 0; i--) {
        let childMapping = createChildMapping(
          this.mapping,
          mappings[i],
          this.match.matchedLocation,
        )
        let match = matchMappingAgainstLocation(childMapping, matchableLocation)
        if (match) {
          this.childMatcherOptions = {
            matchableLocation: matchableLocation,
            mapping: childMapping,
            resolver: this.resolver,
            withContent: this.withContent,
          }
          this.childMaybeResolvableNode = childMapping.maybeResolvableNode

          // The first match is always the only match, as we don't allow
          // for ambiguous patterns.
          break
        }
      }
    }
  }

  execute(): NodeMatcherResult<JunctionRoute<Meta, Content>> {
    if (!this.match) {
      // This junction couldn't be matched due to missing required
      // params, or a non-exact match without a default path.
      return {}
    }

    let hasContent = this.withContent && this.constructor.getContent
    let contentResult: ResolverResult<Content | undefined>
    let contentResolvable: Resolvable<Content | undefined> = hasContent
      ? this.constructor.getContent!
      : undefinedResolver

    contentResult = this.resolver.resolve(contentResolvable, {
      type: this.constructor.type,
      location: this.match!.matchedLocation,
    })

    let childNodeResult: ResolverResult<Node> | undefined
    let resolvables: Resolvable<any>[] = [contentResolvable]
    if (this.childMaybeResolvableNode) {
      if (this.childMaybeResolvableNode.isNode) {
        childNodeResult = {
          status: ResolverStatus.Ready,
          value: this.childMaybeResolvableNode as Node,
        }
      } else {
        childNodeResult = this.resolver.resolve(
          this.childMaybeResolvableNode as ResolvableNode<Node>,
          {
            type: this.constructor.type,
            location: this.match!.matchedLocation,
          },
        )
        resolvables.push(this.childMaybeResolvableNode as ResolvableNode<Node>)
      }
    }

    let childMatcher: NodeMatcher<any> | undefined
    let matcherResult: NodeMatcherResult | undefined
    if (childNodeResult) {
      if (!this.last || this.last.childNodeResult !== childNodeResult) {
        if (childNodeResult.value) {
          // TODO: only create a new matcher if the result id has failed
          childMatcher = new childNodeResult.value(this.childMatcherOptions!)
        }
      } else {
        childMatcher = this.last.childMatcher
      }
    }
    if (childMatcher) {
      matcherResult = childMatcher.execute()
    }

    if (
      !this.last ||
      (matcherResult && matcherResult.route) !== this.last.route ||
      contentResult !== this.last.contentResult
    ) {
      let childMapping = this.childMatcherOptions!.mapping
      let error: any | undefined
      let status: RouteStatus | undefined
      let nextRoute: Route | undefined
      let childResolvables: Resolvable<any>[] = []
      let remainingRoutes: Route[] = []

      nextRoute = matcherResult && matcherResult.route
      childResolvables = (matcherResult && matcherResult.resolvables) || []

      if (childNodeResult) {
        error = childNodeResult.error
        status = (childNodeResult.status as string) as RouteStatus
      }
      if (nextRoute) {
        if (nextRoute.type === RouteType.Junction && nextRoute.nextRoute) {
          remainingRoutes = [nextRoute as Route].concat(
            nextRoute.remainingRoutes,
          )
        } else {
          remainingRoutes = [nextRoute]
        }
      } else if (
        !childNodeResult ||
        (!childNodeResult.error &&
          childNodeResult.status !== ResolverStatus.Busy)
      ) {
        error = new NotFoundError(this.match)
        status = RouteStatus.Error
      }

      // Only create a new route if necessary, to allow for reference-equality
      // based comparisons on routes
      this.last = {
        childNodeResult,
        childMatcher,
        contentResult,
        resolvables: resolvables.concat(childResolvables),
        route: this.createRoute(RouteType.Junction, {
          status: (status as string) as RouteStatus,
          error,
          contentStatus: hasContent
            ? ((contentResult.status as string) as RouteContentStatus)
            : RouteContentStatus.Unrequested,
          contentError: contentResult.error,
          content: contentResult.value,
          meta: this.constructor.meta,
          junction: this.constructor,
          nextPattern: childMapping.pattern,
          nextRoute,
          lastRemainingRoute: remainingRoutes[remainingRoutes.length - 1],
          remainingRoutes,
        }),
      }
    }

    return {
      route: this.last.route,
      resolvables: resolvables.concat(this.last.resolvables),
    }
  }
}

export function createJunction<Meta, Content, Context>(options: {
  paths: JunctionPaths<Context>
  meta?: Meta
  params?: string[]
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
    let { paths, meta, params, getContent, ...other } = options

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
        `createJunction() was called with an empty object {} for "children". This doesn't make any sense.`,
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
    static params = options.params || []
    static mappings = mappings
    static patterns = mappings.map(mapping => mapping.pattern)
    static getContent = options.getContent
  }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
