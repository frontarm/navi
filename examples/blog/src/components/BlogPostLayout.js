import React from 'react'
import { NavContent, NavLink } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import ArticleMeta from './ArticleMeta'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout({ blogPathname }) {
  return (
    <NavContent>
      {(MDXContent, { title, meta, url }) =>
        // The content for posts is an MDX component, so we'll need
        // to use <MDXProvider> to ensure that links are rendered
        // with <NavLink>, and thus use pushState.
        <article className={styles.BlogPostLayout}>
          <header>
            <h1>
              <NavLink href={url.pathname}>{title}</NavLink>
            </h1>
            <ArticleMeta blogPathname={blogPathname} meta={meta} />
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