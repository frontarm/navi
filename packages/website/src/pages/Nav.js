import React from 'react'
import { NavLink } from 'react-navi'
import { NaviBar } from 'navi-bar'
import classNames from 'classnames/bind'
import logo from './logo.svg'
import styles from './Nav.module.scss'

const cx = classNames.bind(styles)

export const Nav = React.forwardRef((props, ref) =>
  <NaviBar
    pageMap={props.pageMap}
    tableOfContents={props.tableOfContents}
    renderSwitch={props => <SidebarSection {...props} />}
    renderPage={props => <SidebarPage {...props} />}
    renderHeading={props => <SidebarHeading {...props} />}
    render={({ children, open, toggleOpen }) =>
      <React.Fragment>
        <NaviBar.CloseOverlay />
        <div className={cx('Nav', { open }) + " " + props.className} style={props.style} ref={ref}>
          <nav className={cx('Sidebar')}>
            <NavLink href={props.rootPathname} className={cx("brand")}>
              <img src={logo} className={cx("logo")} alt="logo" />
              <span className={cx("name")}>Navi</span>
            </NavLink>

            <nav>
              {children}

              <section className={cx('page')}>
                <a href="https://github.com/frontarm/navi" className={cx('link')}>GitHub &raquo;</a>
              </section>
            </nav>
          </nav>
          <button
            className={cx('hamburger')}
            onClick={toggleOpen}>
            <div className={cx('icon')} />
          </button>
        </div>
      </React.Fragment>
    }
  />
)

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

export const SidebarHeading = ({ active, descendantActive, children, title }) => (
  <section className={cx('heading', { active: active || descendantActive })}>
    <NaviBar.Anchor className={cx('link')}>{title}</NaviBar.Anchor>
  </section>
)
