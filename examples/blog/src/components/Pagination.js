import { join } from 'path'
import React from 'react'
import { NavLink } from 'react-navi'
import styles from './Pagination.module.css'

function Pagination({ blogPathname, pageCount, pageNumber }) {
  return (
    <small className={styles.Pagination}>
      {
        pageNumber !== 1 &&
        <NavLink
          className={styles.previous}
          href={join(blogPathname, 'page', String(pageNumber - 1))}>
          ← Previous
        </NavLink>
      }
      <span className={styles.pages}>
        {' '}Page <span className={styles.current}>{pageNumber}</span>/<span className={styles.count}>{pageCount}</span>{' '}
      </span>
      {
        pageNumber < pageCount &&
        <NavLink
          className={styles.next}
          href={join(blogPathname, 'page', String(pageNumber + 1))}>
          Next →
        </NavLink>
      }
    </small>
  )
}

export default Pagination