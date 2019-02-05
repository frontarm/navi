import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { Resolvable, reduceStatuses } from './Resolver'
import { RedirectSegment, createRouteSegment } from './Segments'
import { MatcherBase, MatcherResult, MatcherClass, MatcherOptions } from './Matcher'

const emptyObject = {}

export interface Redirect<Context extends object = any, Info extends object = any>
  extends MatcherClass<Context, RedirectMatcher<Context, Info>> {
  type: 'redirect'

  new (options: MatcherOptions<Context>): RedirectMatcher<Info>

  to: Resolvable<Partial<URLDescriptor> | string>
  info: Resolvable<Info>
}

export class RedirectMatcher<Context extends object = any, Info extends object = any> extends MatcherBase<Context> {
  ['constructor']: Redirect

  static isMatcher = true
  static type: 'redirect' = 'redirect'

  protected execute(): MatcherResult<RedirectSegment<Info>> {
    let toResolution = this.resolver.resolve(this.env, this.constructor.to)
    let { value: to, status, error } = toResolution
    
    let infoResolution = this.resolver.resolve(this.env, this.constructor.info)
    let info = infoResolution.value
    status = reduceStatuses(status, infoResolution.status)
    error = error || infoResolution.error
    
    // TODO: support all relative URLs
    let toHref: string | undefined
    if (typeof to === 'string') {
      if (to.slice(0, 2) === './') {
        toHref = joinPaths(this.env.mountedPathname.split('/').slice(0, -1).join('/'), to.slice(2))
      }
      else {
        toHref = to
      }
    }
    else if (to) {
      toHref = createURLDescriptor(to).href
    }

    return {
      resolutionIds: [toResolution.id, infoResolution.id],
      segment: createRouteSegment('redirect', this.env, {
        to: toHref,
        info: info || emptyObject,
        status,
        error,
        remainingSegments: [],
      }),
    }
  }
}

export function createRedirect<Context extends object = any, Info extends object = any>(
  to: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>,
  info?: Info | Resolvable<Info>,
): Redirect {
  return class extends RedirectMatcher<Context, Info> {
    static to = typeof to === 'function' ? (to as Resolvable<Partial<URLDescriptor> | string>) : () => to
    static info = typeof info === 'function' ? (info as Resolvable<Info>) : () => info
  }
}

export function isValidRedirect(x: any): x is Redirect {
  return x && x.prototype && x.prototype instanceof RedirectMatcher
}