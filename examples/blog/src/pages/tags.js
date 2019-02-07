import React from 'react'
import * as Navi from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash'
import TagIndexPage from '../components/TagIndexPage'
import TagPage from '../components/TagPage'
import getTagsFromSiteMap from '../utils/getTagsFromSiteMap'

const tagPages = Navi.withContext(
  (req, context) => ({
    ...context,
    tagsRoot: req.mountpath,
  }),
  Navi.map({
    '/': Navi.page({
      title: 'Tags',

      getBody: async (req, context) => {
        // Build a list of pages for each tag
        let siteMap = await req.router.resolveSiteMap(context.blogRoot, {
          predicate: segment => segment.url.pathname.indexOf(context.tagsRoot) === -1,
        })
        let tags = getTagsFromSiteMap(siteMap)
        let tagRoutes = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        Object.entries(siteMap.pages).forEach(([_, route]) => {
          let info = route.info
          if (info && info.tags) {
            info.tags.forEach(tag => {
              tag = tag.toLowerCase()
              if (tagRoutes[tag]) {
                tagRoutes[tag].push(route)
              }
            })
          }
        })

        return (
          <TagIndexPage
            blogPathname={context.blogRoot}
            tags={
              tags.map(name => ({
                name,
                href: join(req.mountpath, name.toLowerCase()),
                count: (tagRoutes[name] || []).length
              }))
            }
          />
        )
      }
    }),

    '/:tag': Navi.page({
      getTitle: req => req.params.tag,
      getBody: async (req, context) => {
        let lowerCaseTag = req.params.tag.toLowerCase()

        // Build a list of pages that include the tag from the site map
        let siteMap = await req.router.resolveSiteMap(context.blogRoot, {
          predicate: segment => segment.url.pathname.indexOf(context.tagsRoot) === -1,
        })
        let routes = []
        Object.entries(siteMap.pages).forEach(([_, route]) => {
          let tags = (route.info && route.info.tags) || []
          if (tags.find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
            routes.push(route)
          }
        })

        return (
          <TagPage
            blogPathname={context.blogRoot}
            name={req.params.tag}
            routes={routes}
          />
        )
      }
    })
  })
)

export default tagPages