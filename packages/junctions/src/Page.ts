import { Resolution, Resolvable, undefinedResolver } from './Resolver'
import { Status, RouteType, PageRoute, createRoute } from './Route'
import { NodeMatcher, NodeBase, NodeMatcherOptions } from './Node'

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
  getContent?: Resolvable<Content>
}


export class PageMatcher<Meta, Content, Context> extends NodeMatcher<
  Context,
  PageRoute<Meta, Content>
> {
  ['constructor']: Page<Meta, Content, Context>

  static isNode = true
  static type: RouteType.Page = RouteType.Page

  protected execute() {
    let resolvable: Resolvable<Content | undefined> = 
      this.withContent && this.constructor.getContent
        ? this.constructor.getContent
        : undefinedResolver
    let resolution: Resolution<Content> = this.resolver.resolve(this.env, resolvable)
    
    return {
      resolutionIds: [resolution.id],
      route: createRoute(RouteType.Page, this.env, {
        title: this.constructor.title,
        meta: this.constructor.meta,

        status: resolution.status,
        error: resolution.error,
        content: resolution.value,

        remainingRoutes: [],
      }),
    }
  }
}

export function createPage<Meta, Content, Context=any>(options: {
  title: string
  meta?: Meta
  getContent?: Resolvable<Content>
}): Page<Meta, Content> {
  if (process.env.NODE_ENV !== 'production') {
    let { title, meta, getContent, ...other } = options

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
    static getContent = options.getContent
  }
}
