import { join } from 'path'
import React from 'react'
import { Link } from 'react-navi'
import styles from './Pagination.module.css'

function Pagination({ blogRoot, pageCount, pageNumber }) {
  return (
    <small className={styles.Pagination}>
      {
        pageNumber !== 1 &&
        <Link
          className={styles.previous}
          href={join(blogRoot, 'page', String(pageNumber - 1))}>
          ← Previous
        </Link>
      }
      <span className={styles.pages}>
        {' '}Page <span className={styles.current}>{pageNumber}</span>/<span className={styles.count}>{pageCount}</span>{' '}
      </span>
      {
        pageNumber < pageCount &&
        <Link
          className={styles.next}
          href={join(blogRoot, 'page', String(pageNumber + 1))}>
          Next →
        </Link>
      }
    </small>
  )
}

export default Pagination