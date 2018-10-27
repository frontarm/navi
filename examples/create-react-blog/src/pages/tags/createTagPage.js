import * as React from 'react'
import * as Navi from 'navi'
import { NavLink } from 'react-navi'
import { getSiteMapInfo } from '../../getSiteMapInfo'

function Tag(props) {
  return (
    <div>
      <h1>{props.name} Tag</h1>
      <ul>
        {props.pages.map(page =>
          <li key={page.href}>
            <NavLink href={page.href}>{page.title}</NavLink>
          </li>  
        )}
      </ul>
    </div>
  )
}

export const createTagPage = (tag) =>
  Navi.createPage({
    title: tag,
    getContent: async env => {
      let siteMapInfo = await getSiteMapInfo({ router: env.router })
      let pages = []
      let lowerCaseTag = tag.toLowerCase()
      
      Object.entries(siteMapInfo).forEach(([href, { title, meta }]) => {
        if ((meta.tags || []).find(metaTag => metaTag.toLowerCase() === lowerCaseTag)) {
          pages.push({ title, href, meta })
        }
      })

      return (
        <Tag
          name={tag}
          pages={pages}
        />
      )
    }
  })
