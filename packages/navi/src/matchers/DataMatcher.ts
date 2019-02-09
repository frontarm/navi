import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment, Segment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherGeneratorClass,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export interface DataMatcherGeneratorClass<
  Context extends object = any,
  Data = any
> extends MatcherGeneratorClass<Context, DataMatcherGenerator<Context, Data>> {
  new (options: MatcherOptions<Context>): DataMatcherGenerator<Context, Data>

  childMatcherGeneratorClass: MatcherGeneratorClass<Context> | undefined
  getData: Resolvable<Data, Context>
}

class DataMatcherGenerator<
  Context extends object,
  Data
> extends MatcherGenerator<Context> {
  ['constructor']: DataMatcherGeneratorClass<Context, Data>

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

  protected execute() {
    let resolution = this.resolver.resolve(
      this.env,
      this.constructor.getData,
    )
    let { status, value: data } = resolution
    let segments: Segment[] =
      status === 'ready'
        ? [data ? createSegment('data', this.env.request, { data }) : createSegment('null', this.env.request)]
        : [createNotReadySegment(this.env.request, resolution)]

    let childGeneratorClass = this.constructor.childMatcherGeneratorClass
    let result: Segment[] | undefined
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

    return segments.concat(result || [])
  }
}

export function withData<Context extends object, Data>(
  maybeResolvableData: Data | Resolvable<Data, Context>,
): Matcher<Context> {
  let getData: Resolvable<Data, Context> =
    typeof maybeResolvableData === 'function'
      ? (maybeResolvableData as any)
      : () => maybeResolvableData

  return createMatcher(
    (
      childMatcherGeneratorClass?: MatcherGeneratorClass<Context>,
    ): DataMatcherGeneratorClass<Context, Data> =>
      class extends DataMatcherGenerator<Context, Data> {
        static getData = getData
        static childMatcherGeneratorClass = childMatcherGeneratorClass
      },
  )
}
