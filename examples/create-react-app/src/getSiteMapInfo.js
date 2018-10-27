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

  // In production, we add this at build time. But in development
  // mode, we'll need to generate it at runtime.
  return fromPairs(
    toPairs(siteMap.pages)
      .map(([ path, route ]) => [ path, pick(route, 'title', 'meta') ])
  )
}