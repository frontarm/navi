import { NaviRequest } from './NaviRequest'

export interface Env<Context=any> {
  readonly context: Context
  readonly request: NaviRequest
}
