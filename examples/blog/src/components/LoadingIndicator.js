import React from 'react'
import styles from './LoadingIndicator.module.css'

function LoadingIndicator({ active, className, style }) {
  return (
    <div
      className={`
        ${styles.LoadingIndicator}
        ${active ? styles.active : ''}
        ${className}
      `}
      style={style}
    />
  )
}

export default LoadingIndicator