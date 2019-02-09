import React from 'react'
import { NavLink } from 'react-navi'
import styles from './TagIndexPage.module.css'

function TagIndexPage(props) {
  return (
    <div className={styles.TagIndexPage}>
      <h1>Tags</h1>
      <ul>
        {props.tags.map(tag =>
          <li key={tag.href}>
            <NavLink href={tag.href}>{tag.name} ({tag.count})</NavLink>
          </li>  
        )}
      </ul>
    </div>
  )
}

export default TagIndexPage