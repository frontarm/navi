import React from 'react'
import * as Navi from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash'
import TagIndexPage from '../components/TagIndexPage'
import TagPage from '../components/TagPage'
import getTagsFromSiteMap from '../utils/getTagsFromSiteMap'

const tagsSwitch = Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: 'Tags',
  
      getContent: async env => {
        // Build a list of pages for each tag
        let tagsPathname = env.mountname.replace(/\/$/, '')
        let siteMap = await env.router.resolveSiteMap('/', {
          predicate: segment => segment.url.pathname.indexOf(tagsPathname) === -1,
        })
        let tags = getTagsFromSiteMap(siteMap)
        let tagRoutes = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        Object.entries(siteMap.pages).forEach(([href, route]) => {
          let meta = route.meta
          if (meta && meta.tags) {
            meta.tags.forEach(tag => {
              tag = tag.toLowerCase()
              if (tagRoutes[tag]) {
                tagRoutes[tag].push(route)
              }
              else {
                console.warn(`The page at "${href}" used unindexed tag "${tag}".`)
              }
            })
          }
        })
  
        return (
          <TagIndexPage
            blogPathname={join(env.pathname, '..')}
            tags={
              tags.map(name => ({
                name,
                href: join(env.mountname, name.toLowerCase()),
                count: (tagRoutes[name] || []).length
              }))
            }
          />
        )
      }
    }),

    '/:tag': Navi.createPage({
      getTitle: env => env.params.tag,
      getContent: async env => {
        let lowerCaseTag = env.params.tag.toLowerCase()

        // Build a list of pages that include the tag from the site map
        let tagsPathname = join(env.mountname, '..').replace(/\/$/, '')
        let siteMap = await env.router.resolveSiteMap('/', {
          predicate: segment => segment.url.pathname.indexOf(tagsPathname) === -1,
        })
        let routes = []
        Object.entries(siteMap.pages).forEach(([href, route]) => {
          let tags = (route.meta && route.meta.tags) || []
          if (tags.find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
            routes.push(route)
          }
        })

        return (
          <TagPage
            blogPathname={join(env.pathname, '..', '..')}
            name={env.params.tag}
            routes={routes}
          />
        )
      }
    })
  },
})

export default tagsSwitch