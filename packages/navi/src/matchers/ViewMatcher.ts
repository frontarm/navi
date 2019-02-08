import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment, Segment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherResult,
  MatcherGeneratorClass,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export interface ViewMatcherGeneratorClass<
  Context extends object = any,
  View = any
>
  extends MatcherGeneratorClass<
    Context,
    ViewMatcherGenerator<Context, View>
  > {
  new (options: MatcherOptions<Context>): ViewMatcherGenerator<
    Context,
    View
  >

  childGeneratorClass: MatcherGeneratorClass<Context> | undefined
  getView: Resolvable<View, Context>
}

class ViewMatcherGenerator<
  Context extends object,
  View
> extends MatcherGenerator<Context> {
  ['constructor']: ViewMatcherGeneratorClass<Context, View>

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
      let { id, error, status, value: view } = this.resolver.resolve(
        this.env,
        this.constructor.getView,
      )
      resolutionIds.push(id)

      segments =
        status === 'ready'
          ? (view ? [createSegment('view', this.env.request, { view })] : [])
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

export function withView<Context extends object, View>(
  maybeResolvableView: View | Resolvable<View, Context>,
): Matcher<Context> {
  let getView: Resolvable<View, Context> =
    typeof maybeResolvableView === 'function'
      ? (maybeResolvableView as any)
      : () => maybeResolvableView

  return createMatcher(
    (
      childGeneratorClass?: MatcherGeneratorClass<Context>,
    ): ViewMatcherGeneratorClass<Context, View> =>
      class extends ViewMatcherGenerator<Context, View> {
        static getView = getView
        static childGeneratorClass = childGeneratorClass
      },
  )
}
