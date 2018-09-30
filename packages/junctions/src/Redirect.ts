import { URLDescriptor, createURLDescriptor } from './URLTools'
import { Resolvable } from './Resolver'
import { SegmentType, RedirectSegment, createSegment } from './Segments'
import { NodeMatcher, NodeMatcherResult, NaviNodeBase, NaviNodeType, NodeMatcherOptions } from './Node'

export interface Redirect<Context extends object = any, Meta extends object = any>
  extends NaviNodeBase<Context, RedirectMatcher<Context, Meta>> {
  type: NaviNodeType.Redirect

  new (options: NodeMatcherOptions<Context>): RedirectMatcher<Meta>

  to: Resolvable<Partial<URLDescriptor> | string>
  meta: Meta
}

export class RedirectMatcher<Context extends object = any, Meta extends object = any> extends NodeMatcher<Context> {
  ['constructor']: Redirect

  static isNode = true
  static type: NaviNodeType.Redirect = NaviNodeType.Redirect

  protected execute(): NodeMatcherResult<RedirectSegment<Meta>> {
    let resolution = this.resolver.resolve(this.env, this.constructor.to)
    let value = resolution.value
    
    return {
      resolutionIds: [resolution.id],
      segment: createSegment(SegmentType.Redirect, this.env, {
        to: value && (typeof value === 'string' ? value : createURLDescriptor(value).href),
        status: resolution.status,
        error: resolution.error,
        remainingSegments: [],
      }),
    }
  }
}

export function createRedirect<Context extends object = any, Meta extends object = any>(
  to:
    | Location
    | string
    | Resolvable<Partial<URLDescriptor> | string>,
  meta?: Meta,
): Redirect {
  return class extends RedirectMatcher<Context, Meta> {
    static to = typeof to === 'function' ? to : () => to
    static meta = meta
  }
}
