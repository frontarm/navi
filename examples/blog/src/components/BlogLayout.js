import React from 'react'
import { NavContent, NavLink, NavLoading, NavNotFoundBoundary } from 'react-navi'
import siteMetadata from '../siteMetadata'
import NotFoundPage from './NotFoundPage'
import LoadingIndicator from './LoadingIndicator'
import styles from './BlogLayout.module.css'

function BlogLayout({ blogPathname, isViewingIndex }) {
  return (
    // Once hooks are released, `<NavLoading>` will be able to be replaced
    // with the new `useLoadingRoute` hooks.
    <NavLoading>
      {loadingRoute =>
        <div className={styles.container}>
          <LoadingIndicator active={!!loadingRoute} />

          {
            // Don't show the header on index pages, as it has a special
            // header.
            !isViewingIndex &&
            <header>
              <h3 className={styles.title}>
                <NavLink href={blogPathname}>
                  {siteMetadata.title}
                </NavLink>
              </h3>
            </header>
          }

          <main>
            <NavNotFoundBoundary render={() => <NotFoundPage />}>
              <NavContent />
            </NavNotFoundBoundary>
          </main>
        </div>
      }
    </NavLoading>
  )
}

export default BlogLayout