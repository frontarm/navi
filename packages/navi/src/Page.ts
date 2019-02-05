import { Resolvable, Status, reduceStatuses } from './Resolver'
import { PageSegment, createRouteSegment } from './Segments'
import { MatcherBase, MatcherResult, MatcherClass, MatcherOptions } from './Matcher'

export interface Page<Context extends object = any, Info extends object = any, Content = any>
  extends MatcherClass<Context, PageMatcher<Context, Info, Content>> {
  type: 'page'

  new (options: MatcherOptions<Context>): PageMatcher<
    Context,
    Info,
    Content
  >

  info?: Info
  getInfo?: Resolvable<Info, Context>
  title?: string
  getTitle?: Resolvable<string, Context, Info>
  head?: any[] | JSX.Element
  getHead?: Resolvable<any[] | JSX.Element, Context, Info>
  content?: Content
  getContent?: Resolvable<Content, Context, Info>
}


export class PageMatcher<Context extends object, Info extends object, Content> extends MatcherBase<Context> {
  ['constructor']: Page<Context, Info, Content>

  static isMatcher = true
  static type: 'page' = 'page'

  protected execute(): MatcherResult<PageSegment<Info, Content>> {
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
        this.constructor.getInfo
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
        this.constructor.getInfo
      )
      resolutionIds.push(titleResolution.id)
      title = titleResolution.value
      status = reduceStatuses(status, titleResolution.status)
      error = error || titleResolution.error
    }
    else {
      title = this.constructor.title
    }
    
    return {
      resolutionIds: resolutionIds,
      segment: createRouteSegment('page', this.env.request, {
        title,
        info: info || {},
        status,
        error,
        content,
        head,
        remainingSegments: [],
      }),
    }
  }
}

export function createPage<Context extends object, Info extends object, Content>(options: {
  info?: Info
  getInfo?: Resolvable<Info, Context>
  head?: any[] | JSX.Element
  getHead?: Resolvable<any[] | JSX.Element, Context, Info>
  content?: Content
  getContent?: Resolvable<Content, Context, Info>
  title?: string
  getTitle?: Resolvable<string, Context, Info>

  // deprecated
  meta?: never
  getMeta?: never
}): Page<Context, Info, Content> {
  if (process.env.NODE_ENV !== 'production') {
    let { title, getTitle, meta, getMeta, head, getHead, info, getInfo, content, getContent, ...other } = options

    if (process.env.NODE_ENV === 'development') {
      if (meta) {
        console.warn("DEPRECATED: Specifying a 'meta' option for createPage() is deprecated, and will be removed in Navi 0.12. Please use 'info' instead.")
      }
      if (getMeta) {
        console.warn("DEPRECATED: Specifying a 'getMeta' option for createPage() is deprecated, and will be removed in Navi 0.12. Please use 'getInfo' instead.")
      }
    }

    let unknownKeys = Object.keys(other)
    if (unknownKeys.length) {
      console.warn(
        `createPage() received unknown options ${unknownKeys
          .map(x => `"${x}"`)
          .join(', ')}.`,
      )
    }
  }

  return class extends PageMatcher<Context, Info, Content> {
    static title = options.title
    static getTitle = options.getTitle
    static info = options.info || options.meta
    static getInfo = options.getInfo || options.getMeta
    static head = options.head
    static getHead = options.getHead
    static content = options.content
    static getContent = options.getContent
  }
}

export function isValidPage(x: any): x is Page {
  return x && x.prototype && x.prototype instanceof PageMatcher
}