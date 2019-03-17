import { Matcher } from './Matcher'
import { Route } from './Route'
import { createRouter } from './Router'
import { URLDescriptor } from './URLTools'

export interface ResolveOptions<Context extends object = any> {
  routes: Matcher<Context>

  /**
   * If provided, this part of any URLs will be ignored. This is useful
   * for mounting a Navi app in a subdirectory on a domain.
   */
  basename?: string

  context?: Context

  body?: any,
  headers?: { [name: string]: string },
  method?: string,

  followRedirects?: boolean,
}

export interface ResolveOptionsWithSingleURL<Context extends object = any> extends ResolveOptions<Context> {
  url: string | Partial<URLDescriptor>,
  urls?: never,
}

export interface ResolveOptionsWithManyURLs<Context extends object = any> extends ResolveOptions<Context> {
  url?: never,
  urls: (string | Partial<URLDescriptor>)[],
}

export function resolve<Context extends object = any>(options: ResolveOptionsWithSingleURL<Context>): Promise<Route>;
export function resolve<Context extends object = any>(options: ResolveOptionsWithManyURLs<Context>): Promise<Route[]>;
export async function resolve<Context extends object = any>(options: ResolveOptionsWithSingleURL<Context> | ResolveOptionsWithManyURLs<Context>): Promise<Route | Route[]> {
  let { basename, context, routes, url, urls, ...routerResolveOptions } = options

  if (url && urls) {
    throw new Error('You cannot pass both `url` and `urls` options to resolve(). Please pick one!')
  }
  if (!url && !urls) {
    throw new Error('You must pass one of `url` or `urls` options to resolve().')
  }
  
  let router = createRouter({
    basename,
    context,
    routes,
  })
  
  return router.resolve(url || urls as any, routerResolveOptions)
}
