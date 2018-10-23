import { Resolution, Resolvable, undefinedResolvable, reduceStatuses } from './Resolver'
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

  title: string | Resolvable<string>
  meta: Meta | Resolvable<Meta>
  getContent: Resolvable<Content | undefined>
}


export class PageMatcher<Context extends object, Meta extends object, Content> extends NodeMatcher<Context> {
  ['constructor']: Page<Context, Meta, Content>

  static isNode = true
  static type: NaviNodeType.Page = NaviNodeType.Page

  protected execute(): NodeMatcherResult<PageSegment<Meta, Content>> {
    let contentResolvable: Resolvable<Content | undefined> = 
      this.withContent && this.constructor.getContent
        ? this.constructor.getContent
        : undefinedResolvable
    let contentResolution: Resolution<Content> = this.resolver.resolve(this.env, contentResolvable)
    let resolutionIds = [contentResolution.id]
    let { value: content, status, error } = contentResolution
    
    let title: string | undefined
    if (typeof this.constructor.title === 'function') {
      let titleResolution = this.resolver.resolve(this.env, this.constructor.title)
      resolutionIds.push(titleResolution.id)
      title = titleResolution.value
      status = reduceStatuses(status, titleResolution.status)
      error = error || titleResolution.error
    }
    else {
      title = this.constructor.title
    }
    
    let meta: Meta | undefined
    if (typeof this.constructor.meta === 'function') {
      let metaResolution = this.resolver.resolve(this.env, this.constructor.meta)
      resolutionIds.push(metaResolution.id)
      meta = metaResolution.value
      status = reduceStatuses(status, metaResolution.status)
      error = error || metaResolution.error
    }
    else {
      meta = this.constructor.meta
    }
    
    return {
      resolutionIds: resolutionIds,
      segment: createSegment(SegmentType.Page, this.env, {
        title,
        meta: meta || {},
        status,
        error,
        content,
        remainingSegments: [],
      }),
    }
  }
}

export function createPage<Context extends object, Meta extends object, Content>(options: {
  title: string | Resolvable<string>
  meta?: Meta | Resolvable<Meta>
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
    static meta = options.meta as Resolvable<Meta>
    static getContent = options.getContent || undefinedResolvable
  }
}
