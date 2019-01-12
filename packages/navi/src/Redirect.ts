import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { Resolvable, reduceStatuses } from './Resolver'
import { SegmentType, RedirectSegment, createSegment } from './Segments'
import { NodeMatcher, NodeMatcherResult, NaviNodeBase, NaviNodeType, NodeMatcherOptions } from './Node'

const emptyObject = {}

export interface Redirect<Context extends object = any, Meta extends object = any>
  extends NaviNodeBase<Context, RedirectMatcher<Context, Meta>> {
  type: NaviNodeType.Redirect

  new (options: NodeMatcherOptions<Context>): RedirectMatcher<Meta>

  to: Resolvable<Partial<URLDescriptor> | string>
  meta: Resolvable<Meta>
}

export class RedirectMatcher<Context extends object = any, Meta extends object = any> extends NodeMatcher<Context> {
  ['constructor']: Redirect

  static isNode = true
  static type: NaviNodeType.Redirect = NaviNodeType.Redirect

  protected execute(): NodeMatcherResult<RedirectSegment<Meta>> {
    let toResolution = this.resolver.resolve(this.env, this.constructor.to)
    let { value: to, status, error } = toResolution
    
    let metaResolution = this.resolver.resolve(this.env, this.constructor.meta)
    let meta = metaResolution.value
    status = reduceStatuses(status, metaResolution.status)
    error = error || metaResolution.error
    
    // TODO: support all relative URLs
    let toHref: string | undefined
    if (typeof to === 'string') {
      if (to.slice(0, 2) === './') {
        toHref = joinPaths(this.env.pathname.split('/').slice(0, -1).join('/'), to.slice(2))
      }
      else {
        toHref = to
      }
    }
    else if (to) {
      toHref = createURLDescriptor(to).href
    }

    return {
      resolutionIds: [toResolution.id, metaResolution.id],
      segment: createSegment(SegmentType.Redirect, this.env, {
        to: toHref,
        meta: meta || emptyObject,
        status,
        error,
        remainingSegments: [],
      }),
    }
  }
}

export function createRedirect<Context extends object = any, Meta extends object = any>(
  to: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>,
  meta?: Meta | Resolvable<Meta>,
): Redirect {
  return class extends RedirectMatcher<Context, Meta> {
    static to = typeof to === 'function' ? (to as Resolvable<Partial<URLDescriptor> | string>) : () => to
    static meta = typeof meta === 'function' ? (meta as Resolvable<Meta>) : () => meta
  }
}

export function isValidRedirect(x: any): x is Redirect {
  return x && x.prototype && x.prototype instanceof RedirectMatcher
}