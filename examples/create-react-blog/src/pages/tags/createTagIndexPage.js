import * as React from 'react'
import * as Navi from 'navi'
import { NavLink } from 'react-navi'
import path from 'path'
import { fromPairs } from 'lodash'
import { getSiteMapInfo } from '../../getSiteMapInfo'

function TagIndex(props) {
  return (
    <div>
      <h1>Tags</h1>
      <ul>
        {props.tags.map(tag =>
          <li key={tag.href}>
            <NavLink href={tag.href}>{tag.name}</NavLink>
          </li>  
        )}
      </ul>
    </div>
  )
}

export const createTagIndexPage = (tags) =>
  Navi.createPage({
    title: 'Tags',

    getContent: async env => {
      // Build a list of pages for each tag from the site map
      let siteMapInfo = await getSiteMapInfo({ router: env.router })
      let tagPages = fromPairs(tags.map(name => [name.toLowerCase(), []]))
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

      return (
        <TagIndex
          tags={
            tags.map(name => ({
              name,
              href: path.join(env.context.tagsPathname, name.toLowerCase()),
              pages: tagPages[name.toLowerCase()]
            }))
          }
        />
      )
    }
  })
