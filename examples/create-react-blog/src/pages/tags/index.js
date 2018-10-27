import * as Navi from 'navi'
import * as React from 'react'
import path from 'path'
import { fromPairs } from 'lodash'
import TagIndex from './TagIndex'
import Tag from './Tag'
import { getSiteMapInfo } from '../../getSiteMapInfo'

const TAGS = [
  'Navi',
  'React',
]

export default Navi.createContext(
  env => ({
    ...env.context,
    tagsPathname: env.pathname,
  }),
  Navi.createSwitch({
    paths: {
      '/':
        Navi.createPage({
          title: 'Tags',
          getContent: async env =>
            <TagIndex
              tags={await getTags(env.context.tagsPathname, env.router)}
            />
        }),

      ...fromPairs(
        TAGS.map(tag => [
          '/'+tag.toLowerCase(),
          Navi.createPage({
            title: tag,
            getContent: async env => {
              let tags = await getTags(env.context.tagsPathname, env.router)
              return <Tag {...tags.find(({ name }) => name === tag)} />
            }
          })
        ])
      )
    },
  })
)

async function getTags(tagsPathname, router) {
  let siteMapInfo = await getSiteMapInfo({ router })
  let tagPages = fromPairs(TAGS.map(name => [name.toLowerCase(), []]))
  
  Object.entries(siteMapInfo).forEach(([href, { title, meta }]) => {
    if (meta.tags) {
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

  return TAGS.map(name => ({
    name,
    href: path.join(tagsPathname, name.toLowerCase()),
    pages: tagPages[name.toLowerCase()]
  }))
}