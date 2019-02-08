import { Resolvable, extractDefault } from '../Resolver'
import { createSegment, createNotReadySegment, Segment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherResult,
  MatcherGeneratorClass,
  MatcherOptions,
  createMatcher,
} from '../Matcher'
import { NaviRequest } from '../NaviRequest'

export interface ContentMatcherGeneratorClass<
  Context extends object = any,
  Content = any
>
  extends MatcherGeneratorClass<
    Context,
    ContentMatcherGenerator<Context, Content>
  > {
  new (options: MatcherOptions<Context>): ContentMatcherGenerator<
    Context,
    Content
  >

  childGeneratorClass: MatcherGeneratorClass<Context> | undefined
  getContents: Resolvable<Content[], Context>
}

class ContentMatcherGenerator<
  Context extends object,
  Content
> extends MatcherGenerator<Context> {
  ['constructor']: ContentMatcherGeneratorClass<Context, Content>

  last?: {
    matcherGenerator?: MatcherGenerator<any>
    childGeneratorClass?: MatcherGeneratorClass<Context>
  }

  constructor(options: MatcherOptions<Context>) {
    super(options)
    if (this.constructor.childGeneratorClass) {
      this.wildcard = true
    }
  }

  protected execute(): MatcherResult {
    let segments: Segment[] = []
    let resolutionIds: number[] = []

    if (this.env.request.method !== 'HEAD') {
      let { id, error, status, value: contents } = this.resolver.resolve(
        this.env,
        this.constructor.getContents,
      )
      resolutionIds.push(id)

      segments =
        status === 'ready'
          ? contents!.map(content =>
              createSegment('content', this.env.request, { content }),
            )
          : [createNotReadySegment(this.env.request, error)]

      if (segments.length === 0) {
        segments = [createSegment('null', this.env.request)]
      }
    }

    let childGeneratorClass = this.constructor.childGeneratorClass
    let result: MatcherResult | undefined
    if (childGeneratorClass) {
      // Memoize matcher so its env prop can be used as a key for the resolver
      let matcherGenerator: MatcherGenerator<Context>
      if (!this.last || this.last.childGeneratorClass !== childGeneratorClass) {
        matcherGenerator = new childGeneratorClass({
          env: this.env,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
        this.last = {
          childGeneratorClass,
          matcherGenerator,
        }
      } else {
        matcherGenerator = this.last.matcherGenerator!
      }
      result = matcherGenerator.getResult()
    }

    return {
      resolutionIds: resolutionIds.concat(result ? result.resolutionIds : []),
      segments: segments.concat(result ? result.segments : []),
    }
  }
}

export function withContents<Context extends object, Content>(
  maybeResolvableContent: Content[] | Resolvable<Content[], Context>,
): Matcher<Context> {
  let getContents: Resolvable<Content[], Context> =
    typeof maybeResolvableContent === 'function'
      ? (maybeResolvableContent as any)
      : () => maybeResolvableContent

  return createMatcher(
    (
      childGeneratorClass?: MatcherGeneratorClass<Context>,
    ): ContentMatcherGeneratorClass<Context, Content> =>
      class extends ContentMatcherGenerator<Context, Content> {
        static getContents = getContents
        static childGeneratorClass = childGeneratorClass
      },
  )
}

export function withContent<Context extends object, Content>(
  resolvableContent: Resolvable<Content, Context>,
): Matcher<Context> {
  let getContents = async (req: NaviRequest, context: Context) => {
    let x = await resolvableContent(req, context)
    return wrapWithArray(extractDefault(x))
  }

  return createMatcher(
    (
      childGeneratorClass?: MatcherGeneratorClass<Context>,
    ): ContentMatcherGeneratorClass<Context, Content> =>
      class extends ContentMatcherGenerator<Context, Content> {
        static getContents = getContents
        static childGeneratorClass = childGeneratorClass
      },
  )
}

function wrapWithArray<X>(x: X): X[] {
  return [x]
}
