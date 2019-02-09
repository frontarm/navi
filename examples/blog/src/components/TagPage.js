import React from 'react'
import ArticleSummary from './ArticleSummary'
import styles from './TagPage.module.css'

function TagPage({ blogRoot, name, routes }) {
  return (
    <div className={styles.TagPage}>
      <h1>{name} posts</h1>
      <ul>
        {routes.map(route =>
          <li key={route.url.href}>
            <ArticleSummary blogRoot={blogRoot} route={route} />
          </li>  
        )}
      </ul>
    </div>
  )
}

export default TagPage