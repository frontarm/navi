import './MenuWrapper.less'
import React, { Component } from 'react'
import Link from '../controls/Link'


const LinkView = ({ element, active, primary, children }) =>
  React.cloneElement(element, {
    ...element.props,
    className: `MenuWrapper-link ${active ? 'MenuWrapper-link-active' : ''} ${primary ? 'MenuWrapper-link-primary' : ''}`
  }, children)


export default class MenuWrapper extends Component {
  state = {
    open: false,
  }

  render() {
    const { root, page, route, locate, children } = this.props
    
    const links = []

    let prevPage
    let activePage
    let nextPage

    let prev
    let useNext

    for (let child of page.index) {
      const isChildActive =
        !route.next
          ? child === route.data.page
          : (child === route.next.data.page && !route.next.next)

      if (useNext && child.content) {
        useNext = false
        nextPage = child
      }
      if (isChildActive) {
        useNext = true 
        prevPage = prev
        activePage = child
      }
      prev = child.content ? child : prev

      let subMenu = []
      if (child.index && child != page) {
        for (let grandChild of child.index) {
          if (grandChild.content) {
            const isGrandChildActive =
              !isChildActive &&
              route.next && route.next.next && route.next.next.data.page === grandChild

            if (useNext) {
              useNext = false
              nextPage = grandChild
            }
            if (isGrandChildActive) {
              useNext = true
              prevPage = prev
              activePage = grandChild
            }
            prev = grandChild
            
            subMenu.push(
              <li key={grandChild.id}>
                <Link exact page={grandChild.id} view={<LinkView />}>{grandChild.title}</Link>
              </li>
            )
          }
        }
      }

      links.push(
        <li key={child.id} className={child.content ? 'MenuWrapper-heading' : 'MenuWrapper-section'}>
          {child.content
            ? <Link page={child.id} exact view={<LinkView primary />}>{child.title}</Link>
            : <div>{child.title}</div>
          }
          {
            !!subMenu.length &&
            <ul className="MenuWrapper-submenu">
              {subMenu}
            </ul>
          }
        </li>
      )
    }

    return (
      <div className='MenuWrapper'>
        <div
          className={`
            MenuWrapper-sidebar
            ${this.state.open ? 'MenuWrapper-open' : 'MenuWrapper-closed'}
          `}
        >
          <Link
            page={activePage.id}
            className='MenuWrapper-active'
            onClick={() => {
              this.setState({ open: !this.state.open })
            }}
          >
            {activePage.title}
          </Link>
          <ul
            className='MenuWrapper-menu'
            onClick={() => {
              this.setState({ open: !this.state.open })
            }}
          >
            {links}
          </ul>
          <div className='MenuWrapper-arrows'>
            { prevPage &&
              <Link page={prevPage.id} className='MenuWrapper-arrows-prev'>{prevPage.title}</Link>
            }
            { nextPage &&
              <Link page={nextPage.id} className='MenuWrapper-arrows-next'>{nextPage.title}</Link>
            }
          </div>
        </div>
        <div className='MenuWrapper-body'>
          <h1 className='MenuWrapper-title'>{activePage.title}</h1>
          {children}
          <div className='MenuWrapper-arrows'>
            { prevPage &&
              <Link page={prevPage.id} className='MenuWrapper-arrows-prev'>{prevPage.title}</Link>
            }
            { nextPage &&
              <Link page={nextPage.id} className='MenuWrapper-arrows-next'>{nextPage.title}</Link>
            }
          </div>
        </div>
      </div>
    )
  }
}
