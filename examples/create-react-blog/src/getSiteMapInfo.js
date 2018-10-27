import { fromPairs, toPairs, pick } from 'lodash'

export async function getSiteMapInfo({ siteMap, router }) {
  if (global.siteMapInfo) {
    return global.siteMapInfo
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