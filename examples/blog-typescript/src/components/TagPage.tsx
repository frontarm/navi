import React from 'react'
import ArticleSummary from './ArticleSummary'
import styles from './TagPage.module.css'
import { Route } from 'navi'

interface TagPageProps {
  blogRoot: string
  name: string
  routes: Route[]
}

function TagPage({ blogRoot, name, routes }: TagPageProps) {
  return (
    <div className={styles.TagPage}>
      <h1>{name} posts</h1>
      <ul>
        {routes.map(route => (
          <li key={route.url.href}>
            <ArticleSummary blogRoot={blogRoot} route={route} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TagPage
