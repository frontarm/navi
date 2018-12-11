import React from 'react'
import styles from '../DocumentLayout.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export interface BlockProps {
  children: React.ReactNode
  
  className?: string
  id?: string
  style?: React.CSSProperties
}

export function Block({
  children,
  className='',
  id,
  style,
}: BlockProps) {
  return (
    <div
      className={cx('Block')+' '+className}
      id={id}
      style={style}
    >
      {children}
    </div>
  )
}
