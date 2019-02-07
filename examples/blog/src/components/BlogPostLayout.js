import React from 'react'
import { NavContent, NavLink, useCurrentRoute } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import siteMetadata from '../siteMetadata'
import ArticleMeta from './ArticleMeta'
import Bio from './Bio'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout({ blogPathname }) {
  let { title, info, url } = useCurrentRoute()

  return (
    <NavContent>
      {({ MDXComponent, readingTime }) =>
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
              meta={info}
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
                info.previousDetails &&
                <NavLink className={styles.previous} href={info.previousDetails.href}>
                  ← {info.previousDetails.title}
                </NavLink>
              }
              {
                info.nextDetails &&
                <NavLink className={styles.next} href={info.nextDetails.href}>
                  {info.nextDetails.title} →
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