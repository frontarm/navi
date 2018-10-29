import React from 'react'
import { NavLink } from 'react-navi'
import { NaviBar } from 'navi-bar'
import classNames from 'classnames/bind'
import logo from './logo.svg'
import styles from './Sidebar.scss'

const cx = classNames.bind(styles)

export const Sidebar = (props) =>
  <div className={cx("Sidebar") + " " + props.className} style={props.style}>
    <NavLink href='/' className={cx("brand")}>
      <img src={logo} className={cx("logo")} alt="logo" />
      <span className={cx("name")}>Navi</span>
    </NavLink>

    <nav>
      <NaviBar
        siteMap={props.siteMap}
        tableOfContents={props.tableOfContents}
        renderSwitch={props => <SidebarSection {...props} />}
        renderPage={props => <SidebarPage {...props} />}
        renderHeading={props => <SidebarHeading {...props} />}
      />

      <section className={cx('page')}>
        <a href="https://github.com/frontarm/navi" className={cx('link')}>GitHub &raquo;</a>
      </section>
    </nav>
  </div>

export const SidebarSection = ({ active, children, meta, title }) => (
  <section className={cx('section', { active })}>
    {title && <div className={cx('heading')}>{title}</div>}
    <div className={cx('children')}>{children}</div>
  </section>
)

export const SidebarPage = ({ active, children, meta, title }) => (
  <section className={cx('page', { active })}>
    <NaviBar.Anchor className={cx('link')}>{meta.navTitle || title}</NaviBar.Anchor>
    {children && <div className={cx('children')}>{children}</div>}
  </section>
)

export const SidebarHeading = ({ active, children, title }) => (
  <section className={cx('heading', { active })}>
    <NaviBar.Anchor className={cx('link')}>{title}</NaviBar.Anchor>
    {children && <div className={cx('children')}>{children}</div>}
  </section>
)
