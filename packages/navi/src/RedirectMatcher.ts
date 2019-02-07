import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { Resolvable } from './Resolver'
import { createSegment, createNotReadySegment, Segment } from './Segments'
import { MatcherBase, MatcherResult, MatcherClass, MatcherOptions } from './Matcher'

export interface RedirectMatcher<Context extends object = any>
  extends MatcherClass<Context, RedirectMatcherImplementation<Context>> {
  type: 'redirect'

  new (options: MatcherOptions<Context>): RedirectMatcherImplementation

  to: Resolvable<Partial<URLDescriptor> | string>
}

export class RedirectMatcherImplementation<Context extends object = any> extends MatcherBase<Context> {
  ['constructor']: RedirectMatcher

  static isMatcher = true
  static type: 'redirect' = 'redirect'

  protected execute(): MatcherResult<Segment> {
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
): RedirectMatcher<Context> {
  return class extends RedirectMatcherImplementation<Context> {
    static to = typeof to === 'function' ? (to as Resolvable<Partial<URLDescriptor> | string>) : () => to
  }
}

export function isValidRedirectMatcher(x: any): x is RedirectMatcher {
  return x && x.prototype && x.prototype instanceof RedirectMatcherImplementation
}