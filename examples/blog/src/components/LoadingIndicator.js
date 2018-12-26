import React from 'react'
import styles from './LoadingIndicator.module.css'

const LoadingIndicator = ({
  active,
  className,
  style,
}) => (
  <div
    className={`
      ${styles.LoadingIndicator}
      ${active ? styles.active : ''}
      ${className}
    `}
    style={style}
  />
)

export default LoadingIndicator