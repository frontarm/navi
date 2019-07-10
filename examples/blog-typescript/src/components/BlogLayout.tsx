import React from 'react'
import { Link, NotFoundBoundary, View, useLoadingRoute } from 'react-navi'
import siteMetadata from '../siteMetadata'
import NotFoundPage from './NotFoundPage'
import LoadingIndicator from './LoadingIndicator'
import styles from './BlogLayout.module.css'

interface BlogLayoutProps {
  blogRoot: string
  isViewingIndex: boolean
}

function BlogLayout({ blogRoot, isViewingIndex }: BlogLayoutProps) {
  let loadingRoute = useLoadingRoute()
  return (
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
          <View />
        </NotFoundBoundary>
      </main>
    </div>
  )
}

export default BlogLayout
