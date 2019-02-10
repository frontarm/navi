import React from 'react'
import {
  NavContent,
  Link,
  NavLoading,
  NotFoundBoundary,
} from 'react-navi'
import siteMetadata from '../siteMetadata'
import NotFoundPage from './NotFoundPage'
import LoadingIndicator from './LoadingIndicator'
import styles from './BlogLayout.module.css'

interface BlogLayoutProps {
  blogRoot: string
  isViewingIndex: boolean
}

function BlogLayout({ blogRoot, isViewingIndex }: BlogLayoutProps) {
  return (
    // Once hooks are released, `<NavLoading>` will be able to be replaced
    // with the new `useLoadingRoute` hooks.
    <NavLoading>
      {loadingRoute => (
        <div className={styles.container}>
          <LoadingIndicator active={!!loadingRoute} />

          {// Don't show the header on index pages, as it has a special
          // header.
          !isViewingIndex && (
            <header>
              <h3 className={styles.title}>
                <Link href={blogRoot}>{siteMetadata.title}</Link>
              </h3>
            </header>
          )}

          <main>
            <NotFoundBoundary render={() => <NotFoundPage />}>
              <NavContent />
            </NotFoundBoundary>
          </main>
        </div>
      )}
    </NavLoading>
  )
}

export default BlogLayout
