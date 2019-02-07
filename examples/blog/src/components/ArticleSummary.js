import React from 'react'
import { NavLink } from 'react-navi'
import ArticleMeta from './ArticleMeta'
import styles from './ArticleSummary.module.css'

function ArticleSummary({ blogPathname, route }) {
  return (
    <article className={styles.ArticleSummary}>
      <h2><NavLink href={route.url.href}>{route.title}</NavLink></h2>
      <ArticleMeta blogPathname={blogPathname} meta={route.meta} />
      <p>{route.meta.spoiler}</p>
    </article>
  )
}

export default ArticleSummary