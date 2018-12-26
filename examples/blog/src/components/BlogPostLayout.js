import React from 'react'
import { NavContent, NavLink } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout() {
  return (
    <NavContent>
      {(MDXContent, { title, url }) =>
        // The content for posts is an MDX component, so we'll need
        // to use <MDXProvider> to ensure that links are rendered
        // with <NavLink>, and thus use pushState.
        <article className={styles.BlogPostLayout}>
          <header>
            <h1>
              <NavLink href={url.pathname}>{title}</NavLink>
            </h1>
          </header>
          <MDXProvider components={{ a: NavLink }}>
            <MDXContent />
          </MDXProvider>
        </article>
      }
    </NavContent>
  )
}

export default BlogPostLayout