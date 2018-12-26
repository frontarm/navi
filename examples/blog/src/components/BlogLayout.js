import React from 'react'
import { NavContent, NavLink, NavLoading, NavNotFoundBoundary } from 'react-navi'
import BlogContext from '../BlogContext'
import NotFoundPage from './NotFoundPage'
import LoadingIndicator from './LoadingIndicator'
import styles from './BlogLayout.module.css'

function BlogLayout({ isViewingIndex }) {
  return (
    // Once hooks are released, `<NavLoading>` will be able to be replaced
    // with the new `useLoadingRoute` hooks.
    <BlogContext.Consumer>
      {({pathname, title}) =>
        <NavLoading>
          {loadingRoute =>
            <div className={styles.AppLayout}>
              <LoadingIndicator isLoading={!!loadingRoute} />

              {
                // Don't show the header on index pages, as it has a special
                // header.
                !isViewingIndex &&
                <header>
                  <h3>
                    <NavLink href={pathname}>
                      {title}
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
      }
    </BlogContext.Consumer>
  )
}

export default BlogLayout