import React from 'react'
import {
  NavView,
  NavLink,
  NavNotFoundBoundary,
  useLoadingRoute,
} from 'react-navi'
import siteMetadata from '../siteMetadata'
import NotFoundPage from './NotFoundPage'
import LoadingIndicator from './LoadingIndicator'
import styles from './BlogLayout.module.css'

function BlogLayout({ blogRoot, isViewingIndex }) {
  let loadingRoute = useLoadingRoute()

  return (
    <div className={styles.container}>
      <LoadingIndicator active={!!loadingRoute} />

      {// Don't show the header on index pages, as it has a special header.
      !isViewingIndex && (
        <header>
          <h3 className={styles.title}>
            <NavLink href={blogRoot}>{siteMetadata.title}</NavLink>
          </h3>
        </header>
      )}

      <main>
        <NavNotFoundBoundary render={() => <NotFoundPage />}>
          <NavView />
        </NavNotFoundBoundary>
      </main>
    </div>
  )
}

export default BlogLayout
