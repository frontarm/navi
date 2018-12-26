import { Router } from './Router'
import { Params, URLDescriptor } from './URLTools'
import { HTTPMethod } from './HTTPMethod'

// TODO: rename Env -> Request
export interface Env<Context extends object=any> {
  readonly context: Context
  readonly mountname: string
  readonly params: Params
  readonly router: Router<Context>
  readonly url: URLDescriptor

  // TODO: implement
  readonly body?: any
  readonly headers: { [name: string]: string }
  readonly method: HTTPMethod

  // TODO: deprecate in favor of url.*
  readonly pathname: string
  readonly hash: string
  readonly query: Params
  readonly search: string

  // TODO: remove in favor of just removing mountname from the front of url.pathname
  readonly unmatchedPathnamePart: string
}
