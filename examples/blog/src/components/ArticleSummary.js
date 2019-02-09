import React from 'react'
import { NavLink } from 'react-navi'
import ArticleMeta from './ArticleMeta'
import styles from './ArticleSummary.module.css'

function ArticleSummary({ blogRoot, route }) {
  return (
    <article className={styles.ArticleSummary}>
      <h2><NavLink href={route.url.href}>{route.title}</NavLink></h2>
      <ArticleMeta blogRoot={blogRoot} meta={route.data} />
      <p>{route.data.spoiler}</p>
    </article>
  )
}

export default ArticleSummary