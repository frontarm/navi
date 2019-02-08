//
// Exports
//

export * from './matchers/compat'
export * from './matchers/ContextMatcher'
export * from './matchers/DataMatcher'
export * from './matchers/MapMatcher'
export * from './matchers/ViewMatcher'
export * from './matchers/RedirectMatcher'
export * from './matchers/TitleMatcher'
export * from './matchers/route'
export * from './Errors'
export * from './NaviRequest'
export * from './Segments'
export * from './URLTools'
export { composeMatchers } from './composeMatchers'
export { Router, createRouter } from './Router'
export { Route, RouteType } from './Route'
export { Matcher, isValidMatcher } from './Matcher'
export { Navigation } from './Navigation'
export { createBrowserNavigation, BrowserNavigation } from './BrowserNavigation'
export { createMemoryNavigation, MemoryNavigation } from './MemoryNavigation'
export { Observer, Subscription } from './Observable'

//
// Aliases
//

export { withView as view } from './matchers/ViewMatcher'
export { map as lazy } from './matchers/MapMatcher'
