import { JunctionRoute, SiteMap } from './Route'
import { Router } from './Router'
import { ObservableRouteOptions } from './ObservableRoute'
import { Junction } from './Junction';


export class Env<Context=any, RootJunction extends Junction=any> {
  private router: Router<Context, RootJunction>

  readonly context: Context

  constructor(context: Context, router: Router<Context, RootJunction>) {
    this.context = context
    this.router = router
  }

  route(url: string, options: ObservableRouteOptions): Promise<JunctionRoute<RootJunction>>;
  route(urls: string[], options: ObservableRouteOptions): Promise<JunctionRoute<RootJunction>[]>;
  route(urls: string | string[], options: ObservableRouteOptions): Promise<JunctionRoute<RootJunction> | JunctionRoute<RootJunction>[]> {
    return this.router.route(urls as any, options)
  }

  siteMap(url: string, options: { maxDepth: number, followRedirects: boolean }): Promise<SiteMap<RootJunction>> {
    return this.router.siteMap(url, options)
  }
}