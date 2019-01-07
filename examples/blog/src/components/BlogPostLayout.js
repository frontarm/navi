import React from 'react'
import { NavContent, NavLink } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import siteMetadata from '../siteMetadata'
import ArticleMeta from './ArticleMeta'
import Bio from './Bio'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout({ blogPathname }) {
  return (
    <NavContent>
      {({ MDXComponent, readingTime }, { title, meta, url }) =>
        // The content for posts is an MDX component, so we'll need
        // to use <MDXProvider> to ensure that links are rendered
        // with <NavLink>, and thus use pushState.
        <article className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              <NavLink href={url.pathname}>{title}</NavLink>
            </h1>
            <ArticleMeta
              blogPathname={blogPathname}
              meta={meta}
              readingTime={readingTime}
            />
          </header>
          <MDXProvider components={{
            a: NavLink,
            wrapper: ({ children }) =>
              <div className={styles.content}>
                {children}
              </div>
          }}>
            <MDXComponent />
          </MDXProvider>
          <footer className={styles.footer}>
            <h3 className={styles.title}>
              <NavLink href={blogPathname}>
                {siteMetadata.title}
              </NavLink>
            </h3>
            <Bio className={styles.bio} />
            <section className={styles.links}>
              {
                meta.previousDetails &&
                <NavLink className={styles.previous} href={meta.previousDetails.href}>
                  ← {meta.previousDetails.title}
                </NavLink>
              }
              {
                meta.nextDetails &&
                <NavLink className={styles.next} href={meta.nextDetails.href}>
                  {meta.nextDetails.title} →
                </NavLink>
              }
            </section>
          </footer>
        </article>
      }
    </NavContent>
  )
}

export default BlogPostLayout