import { ResolverResult, Resolvable } from './Resolver'
import { RouteType, PageRoute } from './Route'
import {
  NodeMatcher,
  NodeMatcherResult,
  NodeBase,
  NodeMatcherOptions,
} from './Node'
import { Env } from './Env'

export interface Page<Meta = any, Content = any, Context = any>
  extends NodeBase<Context, PageMatcher<Meta, Content, Context>> {
  type: RouteType.Page

  new (options: NodeMatcherOptions<Context>): PageMatcher<
    Meta,
    Content,
    Context
  >

  title: string
  meta: Meta
  getContent?: ((env: Env<Context>) => Content | PromiseLike<Content>)

  // This is empty, but is used for the typing for ChildRoute
  _content?: Content
}

const undefinedResolver = () => undefined

export class PageMatcher<Meta, Content, Context> extends NodeMatcher<
  Context
> {
  static isNode = true
  static type: RouteType.Page = RouteType.Page

  last?: {
    result: ResolverResult<Content>
    route: PageRoute<Meta, Content>
  };

  ['constructor']: Page<Meta, Content, Context>
  constructor(options: NodeMatcherOptions<Context>) {
    super(options)

    if (this.match) {
      let remainingLocation = this.match.remainingLocation
      if (remainingLocation && remainingLocation.pathname !== '/') {
        // We don't understand the remaining part of the path.
        delete this.match
      }
    }
  }

  execute(): NodeMatcherResult<PageRoute<Meta, Content>> {
    if (!this.match) {
      // Required params are missing, or there is an unknown part to the
      // path.
      return {}
    }

    let resolvable = 
      this.withContent && this.constructor.getContent
        ? this.constructor.getContent
        : (undefinedResolver as any as Resolvable<Content>)

    let result: ResolverResult<Content> =
      this.resolver.resolve(resolvable, {
          type: this.constructor.type,
          location: this.match!.matchedLocation,
      })

    if (!this.last || this.last.result !== result) {
      let { value, status, error } = result

      // Only create a new route if necessary, to allow for reference-equality
      // based comparisons on routes
      this.last = {
        result,
        route: this.createRoute(RouteType.Page, {
          title: this.constructor.title,
          meta: this.constructor.meta,

          status,
          content: value,
          error,
        }),
      }
    }

    return {
      route: this.last.route,
      resolvables: [resolvable],
    }
  }
}

export function createPage<Meta, Content, Context=any>(options: {
  params?: string[]
  title: string
  meta?: Meta
  getContent?: (env: Env<Context>) => Content | Promise<Content>
}): Page<Meta, Content> {
  if (process.env.NODE_ENV !== 'production') {
    let { params, title, meta, getContent, ...other } = options

    let unknownKeys = Object.keys(other)
    if (unknownKeys.length) {
      console.warn(
        `createPage() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }

    if (title === undefined) {
      console.warn(
        `createPage() must be supplied a "title" option. If you don't want to give your page a title, pass "null' as the title.`,
      )
    }
  }

  return class extends PageMatcher<Meta, Content, Context> {
    static title = options.title
    static meta = options.meta as Meta
    static params = options.params || []
    static getContent = options.getContent
  }
}
