import { isValidContextMatcher } from './ContextMatcher'
import { isValidMapMatcher } from './MapMatcher'
import { isValidContentMatcher } from './ContentMatcher'
import { isValidRedirectMatcher } from './RedirectMatcher'
import { Matcher } from './Matcher'

export function isValidMatcher(x: any): x is Matcher<any> {
  return (
    isValidContextMatcher(x) ||
    isValidContentMatcher(x) ||
    isValidRedirectMatcher(x) ||
    isValidMapMatcher(x)
  )
}