import { fromPairs, toPairs, pick } from 'lodash'

/**
 * Returns an object mapping the URL of each of the site's pages to it's `title`
 * and `meta` objects.
 *
 * This object can be computed at runtime given a `router`, or read from a
 * global `pageDetailsMap` object. This allows for access to the page map during
 * development, while also allowing production builds to use a prebuilt copy.
 */
export default async function getPageDetailsMap({ siteMap, router }) {
  if (global.pageDetailsMap) {
    return global.pageDetailsMap
  }

  if (!siteMap) {
    if (!router) {
      throw new Error("You must supply either a siteMap object or router object to getSiteMapInfo")
    }

    siteMap = await router.resolveSiteMap('/')
  }

  // In production, we add this at build time so that the entire page tree
  // doesn't needed to be loaded to compute a list of tags. But in development
  // mode, we'll need to generate it at runtime.
  return fromPairs(
    toPairs(siteMap.pages)
      .map(([ path, route ]) => [ path, pick(route, 'title', 'meta') ])
  )
}