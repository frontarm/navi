# Router

Each navigation object has a **router** object. The router can be used to `resolve()` the Route object for a given URL, or to resolve a map of all pages and redirects under a given url.

## navigation.router.resolve(url)

Returns `Promise<Route>`

## navigation.router.resolveSiteMap(url)

Returns `Promise<{ [pathname]: Route }>`