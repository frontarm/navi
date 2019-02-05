import { isValidContext } from './Context'
import { isValidSwitch } from './Switch'
import { isValidPage } from './Page'
import { isValidRedirect } from './Redirect'
import { Matcher } from './Matcher'

export function isValidMatcher(x: any): x is Matcher {
  return (
    isValidContext(x) ||
    isValidPage(x) ||
    isValidRedirect(x) ||
    isValidSwitch(x)
  )
}