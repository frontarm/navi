import React from 'react'
import { NavLink } from 'react-navi'
import siteMetadata from '../siteMetadata'
import ArticleSummary from './ArticleSummary'
import Bio from './Bio'
import Pagination from './Pagination'
import styles from './BlogIndexPage.module.css'

function BlogIndexPage({ blogPathname, pageCount, pageNumber, postRoutes }) {
  return (
    <div>
      <header>
        <h1 className={styles.title}>
          <NavLink href={blogPathname}>{siteMetadata.title}</NavLink>
        </h1>
        <Bio />
      </header>
      <ul className={styles.articlesList}>
        {postRoutes.map(route =>
          <li key={route.url.href}>
            <ArticleSummary blogPathname={blogPathname} route={route} />
          </li>
        )}
      </ul>
      {
        pageCount > 1 &&
        <Pagination
          blogPathname={blogPathname}
          pageCount={pageCount}
          pageNumber={pageNumber}
        />
      }
      <footer className={styles.footer}>
        <div>
          <a
            href='./rss.xml'
            target='_blank'
            style={{ float: 'right' }}>
            RSS
          </a>
          <NavLink href='./about'>
            About
          </NavLink> &bull;{' '}
          <NavLink href='./tags'>
            Tags
          </NavLink> &bull;{' '}
          <a href='https://github.com/frontarm/create-react-blog'>
            Source
          </a>
        </div>
      </footer>
    </div>
  )
}

export default BlogIndexPage