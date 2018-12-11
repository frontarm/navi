import React from 'react'
import styles from '../DocumentLayout.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export interface AsideProps {
  children: React.ReactNode
  
  className?: string
  id?: string
  style?: React.CSSProperties
}

export function Aside({
  children,
  className='',
  id,
  style,
}: AsideProps) {
  return (
    <aside
      className={cx('Aside')+' '+className}
      id={id}
      style={style}
    >
      {children}
    </aside>
  )
}
