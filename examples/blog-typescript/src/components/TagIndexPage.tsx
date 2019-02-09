import React from 'react'
import { NavLink } from 'react-navi'
import styles from './TagIndexPage.module.css'

interface Tag {
  count: number
  href: string
  name: string
}

interface TagIndexPage {
  tags: Tag[]
}

function TagIndexPage({ tags }: TagIndexPage) {
  return (
    <div className={styles.TagIndexPage}>
      <h1>Tags</h1>
      <ul>
        {tags.map(tag => (
          <li key={tag.href}>
            <NavLink href={tag.href}>
              {tag.name} ({tag.count})
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TagIndexPage
