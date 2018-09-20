import { PageRoute } from './Route'
import { Router, RouterLocationOptions, RouterMapOptions } from './Router'
import { PageRouteMap } from './Maps'


export class RouterEnv<Context=any> {
  private router: Router<Context>

  readonly context: Context

  constructor(context: Context, router: Router<Context>) {
    this.context = context
    this.router = router
  }

  pageRoute(url: string, options: RouterLocationOptions): Promise<PageRoute>;
  pageRoute(urls: string[], options: RouterLocationOptions): Promise<PageRoute[]>;
  pageRoute(urls: string | string[], options: RouterLocationOptions = {}): Promise<PageRoute | PageRoute[]> {
    return this.router.pageRoute(urls as any, options)
  }

  pageMap(url: string, options: RouterMapOptions = {}): Promise<PageRouteMap> {
    return this.router.pageMap(url, options)
  }
}