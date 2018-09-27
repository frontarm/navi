import { Location } from './Location'
import { PageRoute } from './Route'
import { Router } from './Router'
import { PageRouteMap } from './Maps'

export class RouterEnv<Context = any> {
  readonly context: Context
  readonly location: Location
  readonly params: { [name: string]: string }
  readonly router: Router<Context>
  readonly url: string

  constructor(
    context: Context,
    location: Location,
    params: { [name: string]: string },
    router: Router<Context>,
    url: string,
  ) {
    this.context = context
    this.location = location
    this.params = params
    this.router = router
    this.url = url
  }
}
