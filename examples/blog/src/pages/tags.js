import React from 'react'
import * as Navi from 'navi'
import { join } from 'path'
import { fromPairs } from 'lodash-es'
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
        let tagPages = fromPairs(tags.map(name => [name.toLowerCase(), []]))
        Object.entries(siteMap.pages).forEach(([href, { title, meta }]) => {
          if (meta && meta.tags) {
            meta.tags.forEach(tag => {
              tag = tag.toLowerCase()
              if (tagPages[tag]) {
                tagPages[tag].push({ title, href, meta })
              }
              else {
                console.warn(`The page at "${href}" used unindexed tag "${tag}".`)
              }
            })
          }
        })
  
        return (
          <TagIndexPage
            tags={
              tags.map(name => ({
                name,
                href: join(env.mountname, name.toLowerCase()),
                pages: tagPages[name.toLowerCase()]
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
        let pages = []
        Object.entries(siteMap.pages).forEach(([href, { title, meta }]) => {
          if (((meta && meta.tags) || []).find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
            pages.push({ title, href, meta })
          }
        })

        return (
          <TagPage
            name={env.params.tag}
            pages={pages}
          />
        )
      }
    })
  },
})

export default tagsSwitch