import { Router } from './Router'
import { Params } from './URLTools'
import { HTTPMethod } from './HTTPMethod'

export interface Env<Context extends object=any> {
  readonly context: Context
  readonly method: HTTPMethod
  readonly params: Params
  readonly pathname: string
  readonly query: Params
  readonly search: string
  readonly router: Router<Context>
  readonly unmatchedPathnamePart: string
}
