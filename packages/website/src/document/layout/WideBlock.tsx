import React from 'react'
import styles from '../DocumentLayout.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export interface WideBlockProps {
  children: React.ReactNode
  
  className?: string
  id?: string
  style?: React.CSSProperties
}

export function WideBlock({
  children,
  className='',
  id,
  style,
}: WideBlockProps) {
  return (
    <div
      className={cx('WideBlock')+' '+className}
      id={id}
      style={style}
    >
      {children}
    </div>
  )
}