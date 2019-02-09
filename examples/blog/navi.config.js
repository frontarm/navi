import path from 'path'
import getTagsFromSiteMap from './src/utils/getTagsFromSiteMap'

export const renderPageToString = require.resolve('./src/renderPageToString')

export const resolveSiteMapOptions = {
  /**
   * navi-scripts will call this function when creating a list of URLs which
   * need to be statically built. It allows you to substitute in a list of
   * values when URLs contain wildcards, e.g. /tags/:tag -> ["/tags/react"]
   */
  async expandPattern(pattern, router) {
    if (/\/:tag$/.test(pattern)) {
      let siteMap = await router.resolveSiteMap('/')
      return getTagsFromSiteMap(siteMap).map(tag => pattern.replace(':tag', tag))
    }
  },
}

/**
 * Get the file to write each URL to during the build
 */
export function getPagePathname({ url }) {
  if (url.pathname === '/rss/') {
    return 'rss.xml'
  }
  if (url.pathname === '/') {
    return 'index.html'
  }
  return path.join(url.pathname.slice(1), 'index.html')
}
