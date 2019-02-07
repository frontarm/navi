import { Resolvable, extractDefault } from './Resolver'
import { createSegment, Content, createNotReadySegment, Segment } from './Segments'
import { Matcher, MatcherBase, MatcherResult, MatcherClass, MatcherOptions } from './Matcher'
import { NaviRequest } from './NaviRequest'

export interface ContentMatcher<Context extends object = any, C = Content>
  extends MatcherClass<Context, ContentMatcherImplementation<Context, C>> {
  type: 'content'

  new (options: MatcherOptions<Context>): ContentMatcherImplementation<
    Context,
    C
  >

  child: Matcher<Context> | undefined
  getContent: Resolvable<C, Context>
}


export class ContentMatcherImplementation<Context extends object, C = Content> extends MatcherBase<Context> {
  ['constructor']: ContentMatcher<Context, C>

  static isMatcher = true
  static type: 'content' = 'content'

  last?: {
    matcherInstance?: MatcherBase<any>
    matcher?: Matcher<Context>
  };

  constructor(options: MatcherOptions<Context>) {
    super(options)
    
    if (this.constructor.child) {
      this.wildcard = true
    }
  }

  protected execute(): MatcherResult<Segment> {
    let { id, error, status, value: content } = this.resolver.resolve(
      this.env,
      this.constructor.getContent
    )
    let segments: Segment[] =
      status === 'ready'
        ? (content ? [createSegment('content', this.env.request, { content })] : [])
        : [createNotReadySegment(this.env.request, error)]
  
    let matcher = this.constructor.child
    let result: MatcherResult | undefined
    if (matcher) {
      // Memoize matcher so its env prop can be used as a key for the resolver
      let matcherInstance: MatcherBase<Context>
      if (!this.last || this.last.matcher !== matcher) {
        matcherInstance = new matcher({
          env: this.env,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
        this.last = {
          matcher: matcher,
          matcherInstance: matcherInstance,
        }
      }
      else {
        matcherInstance = this.last.matcherInstance!
      }
      result = matcherInstance.getResult()
    }

    return {
      resolutionIds: [id].concat(result ? result.resolutionIds : []),
      segments: segments.concat(result ? result.segments : [])
    }
  }
}

export interface ContentOptions<Context extends object, Info extends object> {
  info?: Info
  getInfo?: Resolvable<Info, Context>
  head?: any
  getHead?: Resolvable<any, Context, Promise<Info>>
  body?: any
  getBody?: Resolvable<any, Context, Promise<Info>>
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Info>>
}

export function withContent<Context extends object, Info extends object, C = Content<Info>>(
  options: Resolvable<C, Context> | ContentOptions<Context, Info>,
  child?: Matcher<Context>
): ContentMatcher<Context, C> {
  let getContent: Resolvable<C, Context>

  if (typeof options === 'function') {
    getContent = options
  }
  else {
    if (process.env.NODE_ENV !== 'production') {
      let {
        title, getTitle, head, getHead, info, getInfo, body, getBody,
        ...other
      } = options

      let unknownKeys = Object.keys(other)
      if (unknownKeys.length) {
        console.warn(
          `content() received unknown options ${unknownKeys
            .map(x => `"${x}"`)
            .join(', ')}.`,
        )
      }
    }

    getContent = async function getContent(req: NaviRequest, context: Context): Promise<C> {
      let infoPromise: Promise<Info> = 
        options.getInfo
          ? Promise.resolve(options.getInfo(req, context, undefined as any)).then(extractDefault).then(inputOrEmptyObject)
          : Promise.resolve(options.info || {})

      let bodyPromise: Promise<any | undefined> | undefined
      let headPromise: Promise<any> | undefined
      let titlePromise: Promise<string | undefined> | undefined

      if (req.method !== 'HEAD') {
        bodyPromise = 
          options.getBody
            ? Promise.resolve(options.getBody(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(options.body)
        headPromise =
        options.getHead
            ? Promise.resolve(options.getHead(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(options.head)
        titlePromise =
          options.getTitle
            ? Promise.resolve(options.getTitle(req, context, infoPromise)).then(extractDefault)
            : Promise.resolve(options.title)
      }

      return {
        info: await infoPromise,
        body: await bodyPromise,
        head: await headPromise,
        title: await titlePromise,
        status: 200,
      } as any
    }
  }

  return class extends ContentMatcherImplementation<Context, C> {
    static getContent = getContent
    static child = child
  }
}

export function isValidContentMatcher(x: any): x is ContentMatcher {
  return x && x.prototype && x.prototype instanceof ContentMatcherImplementation
}

function inputOrEmptyObject(x) {
  return x || {}
}