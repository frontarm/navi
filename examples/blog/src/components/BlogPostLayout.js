import React from 'react'
import { View, Link, useCurrentRoute } from 'react-navi'
import { MDXProvider } from '@mdx-js/tag'
import siteMetadata from '../siteMetadata'
import ArticleMeta from './ArticleMeta'
import Bio from './Bio'
import styles from './BlogPostLayout.module.css'

function BlogPostLayout({ blogRoot }) {
  let { title, data, url } = useCurrentRoute()

  return (
    <View>
      {({ MDXComponent, readingTime }) =>
        // The content for posts is an MDX component, so we'll need
        // to use <MDXProvider> to ensure that links are rendered
        // with <Link>, and thus use pushState.
        <article className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              <Link href={url.pathname}>{title}</Link>
            </h1>
            <ArticleMeta
              blogRoot={blogRoot}
              meta={data}
              readingTime={readingTime}
            />
          </header>
          <MDXProvider components={{
            a: Link,
            wrapper: ({ children }) =>
              <div className={styles.content}>
                {children}
              </div>
          }}>
            <MDXComponent />
          </MDXProvider>
          <footer className={styles.footer}>
            <h3 className={styles.title}>
              <Link href={blogRoot}>
                {siteMetadata.title}
              </Link>
            </h3>
            <Bio className={styles.bio} />
            <section className={styles.links}>
              {
                data.previousDetails &&
                <Link className={styles.previous} href={data.previousDetails.href}>
                  ← {data.previousDetails.title}
                </Link>
              }
              {
                data.nextDetails &&
                <Link className={styles.next} href={data.nextDetails.href}>
                  {data.nextDetails.title} →
                </Link>
              }
            </section>
          </footer>
        </article>
      }
    </View>
  )
}

export default BlogPostLayout