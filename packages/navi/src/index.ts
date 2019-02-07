//
// Exports
//

export { withContext, isValidContextMatcher, ContextMatcher } from './ContextMatcher'
export { map, isValidMapMatcher, MapMatcher } from './MapMatcher'
export { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable'
export { withContent, isValidContentMatcher, ContentMatcher } from './ContentMatcher'
export { redirect, isValidRedirectMatcher, RedirectMatcher } from './RedirectMatcher'
export * from './Errors'
export * from './Maps'
export * from './NaviRequest'
export * from './Segments'
export * from './URLTools'
export { Router, createRouter } from './Router'
export { Route, RouteType, ContentRoute, RedirectRoute } from './Route'
export { MaybeResolvableMatcher, Matcher } from './Matcher'
export { Navigation } from './Navigation'
export { createBrowserNavigation, BrowserNavigation } from './BrowserNavigation'
export { createMemoryNavigation, MemoryNavigation } from './MemoryNavigation'
export { Observer, Subscription } from './Observable'
export { isValidMatcher } from './isValidMatcher'

//
// Aliases
//

export { withContent as page } from './ContentMatcher'

//
// Compat with Navi 0.10
//

import { withContent, ContentMatcher } from './ContentMatcher'
import { map, MapMatcher, MapMatcherPaths } from './MapMatcher'
import { redirect, RedirectMatcher } from './RedirectMatcher'
import { withContext, ContextMatcher } from './ContextMatcher'
import { MaybeResolvableMatcher } from './Matcher'
import { Resolvable } from './Resolver'
import { URLDescriptor } from './URLTools'
import { Content } from './Segments'

export function createPage<Context extends object, Meta extends object, C>(options: {
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Meta>>
  meta?: Meta
  getMeta?: Resolvable<Meta, Context>
  content?: C
  getContent?: Resolvable<C, Context, Promise<Meta>>
}): ContentMatcher<Context, Content<Meta>> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createPage()" is deprecated. From Navi 0.12, `+
      `you'll need to use the "content()" matcher instead.`
    )
  }
  
  return withContent({
    title: options.title,
    getTitle: options.getTitle,
    info: options.meta,
    getInfo: options.getMeta,
    body: options.content,
    getBody: options.getContent,
  })
}

export function createContext<ParentContext extends object=any, ChildContext extends object=any>(
  maybeChildContextResolvable: Resolvable<ChildContext, ParentContext>,
  maybeChildNodeResolvable: MaybeResolvableMatcher<ChildContext>
): ContextMatcher<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createContext()" is deprecated. From Navi 0.12, `+
      `you'll need to use the "withContext()" matcher instead.`
    )
  }

  if (maybeChildNodeResolvable.isMatcher) {
    return withContext(maybeChildContextResolvable, maybeChildNodeResolvable)
  }
  else {
    return withContext(maybeChildContextResolvable, map(maybeChildNodeResolvable as any)) 
  }
}

export function createMap<Context extends object, Meta extends object, C>(options: {
  paths: MapMatcherPaths<Context>
  meta?: Meta
  getMeta?: Resolvable<Meta, Context>
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Meta>>
  content?: C
  getContent?: Resolvable<C, Context, Promise<Meta>>
}): MapMatcher<Context> | ContentMatcher<Context, Content<Meta>> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createMap()" is deprecated. From Navi 0.12, `+
      `you'll need to use the "map()" matcher instead. If you need to set a `+
      `title or other content on the map, wrap it in a "content()" matcher.`
    )
  }

  if (Object.keys(options).length === 1) {
    return map(options.paths)
  }
  else {
    return withContent(
      {
        title: options.title,
        getTitle: options.getTitle,
        info: options.meta,
        getInfo: options.getMeta,
        body: options.content,
        getBody: options.getContent,
      },
      map(options.paths)
    )
  }
}

export function createRedirect<Context extends object = any, Meta extends object = any>(
  to: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>,
  meta?: Meta | Resolvable<Meta>,
): RedirectMatcher<Context> | ContentMatcher<Context, Content<Meta>> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createRedirect()" is deprecated. From Navi 0.12, `+
      `you'll need to use the "redirect()" matcher instead.`
    )
  }

  let matcher = redirect(to)
  if (typeof meta === 'function') {
    return withContent({ getInfo: meta } as any, matcher)
  }
  else if (meta) {
    return withContent({ info: meta }, matcher)
  }
  return redirect(to)
}