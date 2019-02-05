import { Router } from './Router'
import { Params, URLDescriptor } from './URLTools'
import { HTTPMethod } from './HTTPMethod'

// TODO: rename Env -> Request
export interface Env<Context extends object=any> {
  readonly context: Context
  readonly mountedPathname: string
  readonly params: Params
  readonly router: Router<Context>
  readonly url: URLDescriptor

  // TODO: implement
  readonly body?: any
  readonly headers: { [name: string]: string }
  readonly method: HTTPMethod

  // TODO: these are deprecated, remove in Navi 0.12
  readonly mountname: string
  readonly pathname: string
  readonly query: Params
  readonly search: string

  // TODO: remove in favor of just removing mountname from the front of url.pathname
  readonly unmatchedPathnamePart: string
}
