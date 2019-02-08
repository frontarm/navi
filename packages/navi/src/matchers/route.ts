import { Resolvable } from "../Resolver"
import { composeMatchers } from "../composeMatchers"
import { withContents } from "./ContentMatcher"
import { withContext } from "./ContextMatcher"
import { withInfo } from "./InfoMatcher"

interface Route<Info extends object> {
  info?: Info
  content?: any
  contents?: any[]
}

export function route<Context extends object, Info extends object>(maybeResolvableRoute: Route<Info> | Resolvable<Route<Info>, Context> = {}) {
  return composeMatchers(
    withContext(maybeResolvableRoute),
    withInfo((req, context) =>
      context.info
    ),
    withContents((req, context) =>
      (context.contents || []).concat(context.content || [])
    )
  )
}