import { join } from 'path'
import React from 'react'
import { NavLink } from 'react-navi'
import { formatDate } from '../utils/formats'
import styles from './ArticleMeta.module.css'

function ArticleMeta({ blogPathname, meta }) {
  return (
    <small className={styles.ArticleMeta}>
      <time dateTime={meta.date.toUTCString()}>{formatDate(meta.date)}</time>
      {
        meta.tags &&
        meta.tags.length &&
        <>
          {' '}&bull;{' '}
          <ul className={styles.tags}>
            {meta.tags.map(tag =>
              <li key={tag}>
                <NavLink href={join(blogPathname, 'tags', tag)}>{tag}</NavLink>
              </li>
            )}
          </ul>
        </>
      }
    </small>
  )
}

export default ArticleMeta