import { Resolvable, extractDefault, reduceStatuses } from './Resolver'
import { createSegment, Payload, createNotReadySegment, Segment } from './Segments'
import { MatcherBase, MatcherResult, MatcherClass, MatcherOptions } from './Matcher'
import { NaviRequest } from './NaviRequest';

export interface Page<Context extends object = any, Info extends object = any, Content = any>
  extends MatcherClass<Context, PageMatcher<Context, Info, Content>> {
  type: 'page'

  new (options: MatcherOptions<Context>): PageMatcher<
    Context,
    Info,
    Content
  >

  getPayload: Resolvable<Payload<Info, Content>, Context>
}


export class PageMatcher<Context extends object, Info extends object, Content> extends MatcherBase<Context> {
  ['constructor']: Page<Context, Info, Content>

  static isMatcher = true
  static type: 'page' = 'page'

  protected execute(): MatcherResult<Segment> {
    // todo: match children if necessary

    let { id, error, status, value: payload } = this.resolver.resolve(
      this.env,
      this.constructor.getPayload
    )
    if (status !== 'ready') {
      return {
        resolutionIds: [id],
        segments: [createNotReadySegment(this.env.request, error)],
      }
    }
    return {
      resolutionIds: [id],
      segments: [createSegment('payload', this.env.request, { payload })],
    }
  }
}

export function createPage<Context extends object, Info extends object, Content>(options: Resolvable<Payload<Info, Content>, Context> | {
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
  let getPayload: Resolvable<Payload<Info, Content>, Context>

  if (typeof options === 'function') {
    getPayload = options
  }
  else {
    let { title, getTitle, meta, getMeta, head, getHead, info, getInfo, content, getContent, ...other } = options

    if (process.env.NODE_ENV !== 'production') {
      if (meta) {
        info = meta
        console.warn("DEPRECATED: Specifying a 'meta' option for createPage() is deprecated, and will be removed in Navi 0.12. Please use 'info' instead.")
      }
      if (getMeta) {
        getInfo = getMeta
        console.warn("DEPRECATED: Specifying a 'getMeta' option for createPage() is deprecated, and will be removed in Navi 0.12. Please use 'getInfo' instead.")
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

    getPayload = async function getPayload(req: NaviRequest, context: Context): Promise<Payload> {
      let infoPromise: Promise<Info> = 
        getInfo
          ? Promise.resolve(getInfo(req, context, undefined as any)).then(extractDefault).then(inputOrEmptyObject)
          : Promise.resolve(info || {})

      let contentPromise: Promise<Content | undefined> | undefined
      let headPromise: Promise<any> | undefined
      let titlePromise: Promise<string | undefined> | undefined

      if (req.method !== 'HEAD') {
        contentPromise = 
          getContent
            ? Promise.resolve(getContent(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(content)
        headPromise =
          getHead
            ? Promise.resolve(getHead(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(head)
        titlePromise =
          getTitle
            ? Promise.resolve(getTitle(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(title)
      }

      return {
        info: await infoPromise,
        content: await contentPromise,
        head: await headPromise,
        title: await titlePromise,
        status: 200,
      }
    }
  }

  return class extends PageMatcher<Context, Info, Content> {
    static getPayload = getPayload
  }
}

export function isValidPage(x: any): x is Page {
  return x && x.prototype && x.prototype instanceof PageMatcher
}

function inputOrEmptyObject(x) {
  return x || {}
}