import { URLDescriptor, createURLDescriptor } from './URLTools'
import { Resolution, Resolvable } from './Resolver'
import { RouteType, RedirectRoute, Status, createRoute } from './Route'
import { NodeMatcher, NodeBase, NodeMatcherOptions } from './Node'

export interface Redirect<Meta = any, Context = any>
  extends NodeBase<Context, RedirectMatcher<Meta, Context>> {
  type: RouteType.Redirect

  new (options: NodeMatcherOptions<Context>): RedirectMatcher<Meta>

  to: Resolvable<Partial<URLDescriptor> | string>
  meta: Meta
}

export class RedirectMatcher<Meta = any, Context = any> extends NodeMatcher<
  Context,
  RedirectRoute<Meta>
> {
  ['constructor']: Redirect

  static isNode = true
  static type: RouteType.Redirect = RouteType.Redirect

  protected execute() {
    let resolution = this.resolver.resolve(this.env, this.constructor.to)
    let value = resolution.value
    
    return {
      resolutionIds: [resolution.id],
      route: createRoute(RouteType.Redirect, this.env, {
        to: value && (typeof value === 'string' ? value : createURLDescriptor(value).href),
        status: resolution.status,
        error: resolution.error,
        remainingRoutes: [],
      }),
    }
  }
}

export function createRedirect<Meta = any, Context = any>(
  to:
    | Location
    | string
    | Resolvable<Partial<URLDescriptor> | string>,
  meta?: Meta,
): Redirect {
  return class extends RedirectMatcher<Meta, Context> {
    static to = typeof to === 'function' ? to : () => to
    static meta = meta
  }
}
