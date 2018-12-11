import React from 'react'
import styles from '../DocumentLayout.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export interface AsideOrAfterProps {
  aside: React.ReactNode
  children: React.ReactNode
  
  className?: string
  id?: string
  style?: React.CSSProperties
}

export function AsideOrAfter({
  aside,
  children,
  className = '',
  id,
  style,
}: AsideOrAfterProps) {
  return (
    <div
      className={cx('AsideOrAfter')+' '+className}
      id={id}
      style={style}
    >
      <div className={cx('content')}>
        {children}
      </div>
      <aside className={cx('aside')}>
        {aside}
      </aside>
    </div>
  )
}

