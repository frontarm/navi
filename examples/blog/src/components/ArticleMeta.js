import { join } from 'path'
import React from 'react'
import { Link } from 'react-navi'
import { formatDate } from '../utils/formats'
import styles from './ArticleMeta.module.css'

function ArticleMeta({ blogRoot, meta, readingTime }) {
  let readingTimeElement
  if (readingTime) {
    let minutes = Math.max(Math.round(readingTime.minutes), 1)
    let cups = Math.round(minutes / 5);
    readingTimeElement =
      <React.Fragment>
        {' '}&bull;{' '}
        <span className={styles.readingTime}>
          {new Array(cups || 1).fill('☕️').join('')} {minutes} min read
        </span>
      </React.Fragment>
  }
      
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
                <Link href={join(blogRoot, 'tags', tag)}>{tag}</Link>
              </li>
            )}
          </ul>
        </>
      }
      {readingTimeElement || null}
    </small>
  )
}

export default ArticleMeta