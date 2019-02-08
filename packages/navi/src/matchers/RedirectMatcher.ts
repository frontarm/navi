import { URLDescriptor, createURLDescriptor, joinPaths } from '../URLTools'
import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment } from '../Segments'
import { MatcherGenerator, MatcherGeneratorClass, MatcherResult, MatcherOptions, Matcher, createMatcher } from '../Matcher'

export interface RedirectMatcherGeneratorClass<Context extends object = any>
  extends MatcherGeneratorClass<Context, RedirectMatcherGenerator<Context>> {
  
  new (options: MatcherOptions<Context>): RedirectMatcherGenerator

  to: Resolvable<Partial<URLDescriptor> | string>
}

class RedirectMatcherGenerator<Context extends object = any> extends MatcherGenerator<Context> {
  ['constructor']: RedirectMatcherGeneratorClass
  
  protected execute(): MatcherResult {
    let toResolution = this.resolver.resolve(this.env, this.constructor.to)
    let { value: to, status, error } = toResolution

    if (status !== 'ready') {
      return {
        resolutionIds: [toResolution.id],
        segments: [createNotReadySegment(this.env.request, error)]
      }
    }
    
    // TODO: support all relative URLs
    let toHref: string | undefined
    if (typeof to === 'string') {
      if (to.slice(0, 2) === './') {
        toHref = joinPaths(this.env.request.mountpath.split('/').slice(0, -1).join('/'), to.slice(2))
      }
      else {
        toHref = to
      }
    }
    else if (to) {
      toHref = createURLDescriptor(to).href
    }
    return {
      resolutionIds: [toResolution.id],
      segments: [createSegment('redirect', this.env.request, { to: toHref! })],
    }
  }
}

export function redirect<Context extends object = any>(
  to: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>
): Matcher<Context> {
  return createMatcher(() =>
    class extends RedirectMatcherGenerator<Context> {
      static to = typeof to === 'function' ? (to as Resolvable<Partial<URLDescriptor> | string>) : () => to
    }
  )
}
