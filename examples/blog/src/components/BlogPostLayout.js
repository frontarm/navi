import React from 'react'
import { NavView, NavLink, useCurrentRoute } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import siteMetadata from '../siteMetadata'
import ArticleMeta from './ArticleMeta'
import Bio from './Bio'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout({ blogRoot }) {
  let { title, data, url } = useCurrentRoute()

  return (
    <NavView>
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
              blogRoot={blogRoot}
              meta={data}
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
              <NavLink href={blogRoot}>
                {siteMetadata.title}
              </NavLink>
            </h3>
            <Bio className={styles.bio} />
            <section className={styles.links}>
              {
                data.previousDetails &&
                <NavLink className={styles.previous} href={data.previousDetails.href}>
                  ← {data.previousDetails.title}
                </NavLink>
              }
              {
                data.nextDetails &&
                <NavLink className={styles.next} href={data.nextDetails.href}>
                  {data.nextDetails.title} →
                </NavLink>
              }
            </section>
          </footer>
        </article>
      }
    </NavView>
  )
}

export default BlogPostLayout