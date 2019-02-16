import React from 'react'
import { compose, mount, route, withContext, Route } from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash'
import TagIndexPage from '../components/TagIndexPage'
import TagPage from '../components/TagPage'
import getTagsFromSiteMap from '../utils/getTagsFromSiteMap'

interface TagsNavContext {
  blogRoot: string
  tagsRoot: string
}

const tagRoutes = compose(
  withContext((req, context): TagsNavContext => ({
    ...context,
    tagsRoot: req.mountpath,
  })),
  mount({
    '/': route({
      title: 'Tags',

      getView: async req => {
        // Build a list of pages for each tag
        let tagsPathname = req.mountpath.replace(/\/$/, '')
        let siteMap = await req.router.resolveSiteMap('/', {
          predicate: segment =>
            segment.url.pathname.indexOf(tagsPathname) === -1,
        })
        let tags = getTagsFromSiteMap(siteMap)
        let tagRoutes = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        Object.values(siteMap.routes).forEach((route: Route) => {
          let data = route.data
          if (data && data.tags) {
            data.tags.forEach(tag => {
              tag = tag.toLowerCase()
              if (tagRoutes[tag]) {
                tagRoutes[tag].push(route)
              }
            })
          }
        })

        return (
          <TagIndexPage
            tags={tags.map(name => ({
              name,
              href: join(req.mountpath, name.toLowerCase()),
              count: (tagRoutes[name] || []).length,
            }))}
          />
        )
      },
    }),

    '/:tag': route({
      getTitle: req => req.params.tag,
      getView: async (req, context: TagsNavContext) => {
        let lowerCaseTag = req.params.tag.toLowerCase()

        // Build a list of pages that include the tag from the site map
        let siteMap = await req.router.resolveSiteMap(context.blogRoot, {
          predicate: segment =>
            segment.url.pathname.indexOf(context.tagsRoot) === -1,
        })
        let routes = [] as Route[]
        Object.values(siteMap.routes).forEach((route: Route) => {
          let tags = (route.data && route.data.tags) || []
          if (tags.find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
            routes.push(route)
          }
        })

        return (
          <TagPage
            blogRoot={context.blogRoot}
            name={req.params.tag}
            routes={routes}
          />
        )
      },
    }),
  })
)

export default tagRoutes
