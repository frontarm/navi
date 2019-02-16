import React from 'react'
import { compose, mount, route, withContext } from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash'
import TagIndexPage from '../components/TagIndexPage'
import TagPage from '../components/TagPage'
import getTagsFromSiteMap from '../utils/getTagsFromSiteMap'

const tagRoutes = compose(
  withContext((req, context) => ({
    ...context,
    tagsRoot: req.mountpath,
  })),
  mount({
    '/': route({
      title: 'Tags',

      getView: async (req, context) => {
        // Build a list of pages for each tag
        let siteMap = await req.router.resolveSiteMap(context.blogRoot, {
          predicate: chunk =>
            chunk.url.pathname.indexOf(context.tagsRoot) === -1,
        })
        let tags = getTagsFromSiteMap(siteMap)
        let tagRoutes = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        Object.values(siteMap.routes).forEach((route) => {
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
            blogRoot={context.blogRoot}
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
      getView: async (req, context) => {
        let lowerCaseTag = req.params.tag.toLowerCase()

        // Build a list of pages that include the tag from the site map
        let siteMap = await req.router.resolveSiteMap(context.blogRoot, {
          predicate: chunk =>
            chunk.url.pathname.indexOf(context.tagsRoot) === -1,
        })
        let routes = []
        Object.entries(siteMap.routes).forEach(([_, route]) => {
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
  }),
)

export default tagRoutes
