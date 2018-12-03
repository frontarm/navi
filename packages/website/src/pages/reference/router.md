# Router

Your `Navigation` and `Env` objects contain a `Router` instance, which can be used to fetch a `Route` or map of all child `Route` objects for a given URL.

## `router.resolve()`

```typescript
router.resolve(url, options?: {
  followRedirects?: boolean,
  withContent?: boolean,
})
```

Returns a `Promise<Route>`

## `router.resolveSiteMap()`

```typescript
router.resolveSiteMap(url, options? :{
  followRedirects?: boolean,
  maxDepth?: number,
  predicate?: (segment: Segment) => boolean,
})
```

Returns a `Promise<{ [pathname]: Route }>` that maps each of the URLs under and including `url` to a [Route object](./route/#route).

This is useful for automatically generating lists of content, e.g. for a blog's index page, a static rendering tool, or a sidebar. In fact, this site's navigation sidebars are all generated using the result of `router.resolveSiteMap()`.
