import React from 'react'
import { NavLink } from 'react-navi'
import styles from './TagPage.module.css'

function TagPage(props) {
  return (
    <div className={styles.TagPage}>
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

export default TagPage