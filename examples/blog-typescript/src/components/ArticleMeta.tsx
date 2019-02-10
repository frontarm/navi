import { join } from 'path'
import React from 'react'
import { Link } from 'react-navi'
import { formatDate } from '../utils/formats'
import styles from './ArticleMeta.module.css'

interface ArticleMetaProps {
  blogRoot: string
  data: any
  readingTime?: any
}

function ArticleMeta({ blogRoot, data, readingTime }: ArticleMetaProps) {
  let readingTimeElement
  if (readingTime) {
    let minutes = Math.max(Math.round(readingTime.minutes), 1)
    let cups = Math.round(minutes / 5)
    readingTimeElement = (
      <React.Fragment>
        {' '}
        &bull;{' '}
        <span className={styles.readingTime}>
          {new Array(cups || 1).fill('☕️').join('')} {minutes} min read
        </span>
      </React.Fragment>
    )
  }

  return (
    <small className={styles.ArticleMeta}>
      <time dateTime={data.date.toUTCString()}>{formatDate(data.date)}</time>
      {data.tags && data.tags.length && (
        <>
          {' '}
          &bull;{' '}
          <ul className={styles.tags}>
            {data.tags.map(tag => (
              <li key={tag}>
                <Link href={join(blogRoot, 'tags', tag)}>{tag}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {readingTimeElement || null}
    </small>
  )
}

export default ArticleMeta
