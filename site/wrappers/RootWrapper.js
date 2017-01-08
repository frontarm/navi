import './RootWrapper.less'
import React from 'react'
import Link from '../controls/Link'


const LinkView = ({ element, active, children }) =>
  React.cloneElement(element, {
    ...element.props,
    className: `RootWrapper-link ${active ? 'RootWrapper-link-active' : ''}`
  }, children)


export default function RootWrapper({ root, page, route, locate, children }) {
  return (
    <div className='RootWrapper'>
      <div className='RootWrapper-header'>
        <div className='RootWrapper-header-inner'>
          <Link page='/' className='RootWrapper-junctions'><div className='RootWrapper-junctions-logo' />Junctions</Link>
          <Link page='/docs/introduction/do-i-need-a-router' view={<LinkView />}>Guide</Link>
          <Link page='/examples/Raw' view={<LinkView />}>Examples</Link>
          <Link page='/docs/api' view={<LinkView />}>API Reference</Link>
          <a className='RootWrapper-link' href="https://github.com/jamesknelson/junctions">GitHub</a>
        </div>
      </div>
      <div className='RootWrapper-body'>
        <div>{children}</div>
      </div>
      <div className='RootWrapper-footer'>
        Copyright &copy; 2017 <a href="http://www.jamesknelson.com">James K Nelson</a>
      </div>
    </div>
  )
}
