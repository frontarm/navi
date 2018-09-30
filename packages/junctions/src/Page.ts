import { Resolution, Resolvable, undefinedResolver } from './Resolver'
import { SegmentType, PageSegment, createSegment } from './Segments'
import { NodeMatcher, NodeMatcherResult, NaviNodeBase, NaviNodeType, NodeMatcherOptions } from './Node'

export interface Page<Context extends object = any, Meta extends object = any, Content = any>
  extends NaviNodeBase<Context, PageMatcher<Context, Meta, Content>> {
  type: NaviNodeType.Page

  new (options: NodeMatcherOptions<Context>): PageMatcher<
    Context,
    Meta,
    Content
  >

  title: string
  meta: Meta
  getContent?: Resolvable<Content>
}


export class PageMatcher<Context extends object, Meta extends object, Content> extends NodeMatcher<Context> {
  ['constructor']: Page<Context, Meta, Content>

  static isNode = true
  static type: NaviNodeType.Page = NaviNodeType.Page

  protected execute(): NodeMatcherResult<PageSegment<Meta, Content>> {
    let resolvable: Resolvable<Content | undefined> = 
      this.withContent && this.constructor.getContent
        ? this.constructor.getContent
        : undefinedResolver
    let resolution: Resolution<Content> = this.resolver.resolve(this.env, resolvable)
    
    return {
      resolutionIds: [resolution.id],
      segment: createSegment(SegmentType.Page, this.env, {
        title: this.constructor.title || '',
        meta: this.constructor.meta,

        status: resolution.status,
        error: resolution.error,
        content: resolution.value,

        remainingSegments: [],
      }),
    }
  }
}

export function createPage<Context extends object, Meta extends object, Content>(options: {
  title: string
  meta?: Meta
  getContent?: Resolvable<Content, Context>
}): Page<Context, Meta, Content> {
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

  return class extends PageMatcher<Context, Meta, Content> {
    static title = options.title
    static meta = options.meta as Meta
    static getContent = options.getContent
  }
}
