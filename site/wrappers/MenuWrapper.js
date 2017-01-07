import './MenuWrapper.less'
import React from 'react'
import Link from '../controls/Link'


const LinkView = ({ element, active, primary, children }) =>
  React.cloneElement(element, {
    ...element.props,
    className: `MenuWrapper-link ${active ? 'MenuWrapper-link-active' : ''} ${primary ? 'MenuWrapper-link-primary' : ''}`
  }, children)


export default function MenuWrapper({ root, page, route, locate, children }) {
  const links = page.index.map(child =>
    <li key={child.id}>
      {child.content
        ? <Link page={child.id} exact view={<LinkView primary />}>{child.title}</Link>
        : <div className='MenuWrapper-heading'>{child.title}</div>
      }
      {
        child.index &&
        child != page &&
        <ul className="MenuWrapper-submenu">
          {child.index.map(grandchild =>
            grandchild.content &&
            <li key={grandchild.id}><Link exact page={grandchild.id} view={<LinkView />}>{grandchild.title}</Link></li>
          )}
        </ul>
      }
    </li>
  )

  return (
    <div className='MenuWrapper'>
      <div className='MenuWrapper-sidebar'>
        <ul className='MenuWrapper-menu'>
          {links}
        </ul>
      </div>
      <div className='MenuWrapper-body'>{children}</div>
    </div>
  )
}
