import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment, Segment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherGeneratorClass,
  MatcherResult,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export interface InfoMatcherGeneratorClass<
  Context extends object = any,
  Info = any
> extends MatcherGeneratorClass<Context, InfoMatcherGenerator<Context, Info>> {
  new (options: MatcherOptions<Context>): InfoMatcherGenerator<Context, Info>

  childMatcherGeneratorClass: MatcherGeneratorClass<Context> | undefined
  getInfo: Resolvable<Info, Context>
}

class InfoMatcherGenerator<
  Context extends object,
  Info
> extends MatcherGenerator<Context> {
  ['constructor']: InfoMatcherGeneratorClass<Context, Info>

  last?: {
    matcherGenerator?: MatcherGenerator<any>
    matcherGeneratorClass?: MatcherGeneratorClass<Context>
  }

  constructor(options: MatcherOptions<Context>) {
    super(options)
    if (this.constructor.childMatcherGeneratorClass) {
      this.wildcard = true
    }
  }

  protected execute(): MatcherResult {
    let { id, error, status, value: info } = this.resolver.resolve(
      this.env,
      this.constructor.getInfo,
    )
    let segments: Segment[] =
      status === 'ready'
        ? (
          info
          ? [createSegment('info', this.env.request, { info })]
          : [createSegment('null', this.env.request)]
        )
        : [createNotReadySegment(this.env.request, error)]

    let childGeneratorClass = this.constructor.childMatcherGeneratorClass
    let result: MatcherResult | undefined
    if (childGeneratorClass) {
      // Memoize matcher so its env prop can be used as a key for the resolver
      let matcherGenerator: MatcherGenerator<Context>
      if (
        !this.last ||
        this.last.matcherGeneratorClass !== childGeneratorClass
      ) {
        matcherGenerator = new childGeneratorClass({
          env: this.env,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
        this.last = {
          matcherGeneratorClass: childGeneratorClass,
          matcherGenerator: matcherGenerator,
        }
      } else {
        matcherGenerator = this.last.matcherGenerator!
      }
      result = matcherGenerator.getResult()
    }

    return {
      resolutionIds: [id].concat(result ? result.resolutionIds : []),
      segments: segments.concat(result ? result.segments : []),
    }
  }
}

export function withInfo<Context extends object, Info>(
  maybeResolvableInfo: Info | Resolvable<Info, Context>,
): Matcher<Context> {
  let getInfo: Resolvable<Info, Context> =
    typeof maybeResolvableInfo === 'function'
      ? (maybeResolvableInfo as any)
      : () => maybeResolvableInfo

  return createMatcher(
    (
      childMatcherGeneratorClass?: MatcherGeneratorClass<Context>,
    ): InfoMatcherGeneratorClass<Context, Info> =>
      class extends InfoMatcherGenerator<Context, Info> {
        static getInfo = getInfo
        static childMatcherGeneratorClass = childMatcherGeneratorClass
      },
  )
}
