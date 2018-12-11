import React from 'react'
import styles from '../DocumentLayout.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export interface FullBlockProps {
  children: React.ReactNode
  
  className?: string
  id?: string
  style?: React.CSSProperties
}

export function FullBlock({
  children,
  className='',
  id,
  style,
}: FullBlockProps) {
  return (
    <div
      className={cx('FullBlock')+' '+className}
      id={id}
      style={style}
    >
      {children}
    </div>
  )
}

