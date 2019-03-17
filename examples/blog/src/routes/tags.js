import React from 'react'
import { compose, crawl, mount, resolve, route, withContext, withCrawlerPatterns } from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash'
import TagIndexPage from '../components/TagIndexPage'
import TagPage from '../components/TagPage'
import routes from './index'

async function crawlRoutes(root) {
  if (!crawlRoutes.cache[root]) {
    let { paths } = await crawl({
      context: {
        crawlingRoutes: true,
      },
      root,
      routes,
    })
    crawlRoutes.cache[root] = await resolve({
      method: 'HEAD',
      routes,
      urls: paths,
    }) 
  }
  return crawlRoutes.cache[root]
}
crawlRoutes.cache = {}

const tagRoutes = compose(
  withContext((req, context) => ({
    ...context,
    tagsRoot: req.mountpath,
  })),
  withCrawlerPatterns({
    '/:tag': async (req, context) => {
      if (!context.crawlingRoutes) {
        return getAvailableTagsFromRoutes(
          await crawlRoutes(context.blogRoot)
        ).map(tag => '/'+tag)
      }
      return []
    }
  }),
  mount({
    '/': route({
      title: 'Tags',

      getView: async (req, context) => {
        // Build a list of pages for each tag
        let routes = await crawlRoutes(context.blogRoot)
        let tags = getAvailableTagsFromRoutes(routes)
        let tagRoutes = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        routes.forEach(route => {
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
        let routes = await crawlRoutes(context.blogRoot)

        // Build a list of pages that include the tag from the site map
        let tagRoutes = []
        routes.forEach(route => {
          let tags = (route.data && route.data.tags) || []
          if (tags.find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
            tagRoutes.push(route)
          }
        })

        return (
          <TagPage
            blogRoot={context.blogRoot}
            name={req.params.tag}
            routes={tagRoutes}
          />
        )
      },
    }),
  }),
)

function getAvailableTagsFromRoutes(routes) {
  return Array.from(
    new Set(
      [].concat(...routes.map(route => (route.data && route.data.tags) || [])),
    ),
  )
}

export default tagRoutes
