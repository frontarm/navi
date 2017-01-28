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
          <Link href='/' className='RootWrapper-junctions'><div className='RootWrapper-junctions-logo' />Junctions</Link>
          <a className='RootWrapper-github' href="https://github.com/jamesknelson/junctions">GitHub</a>
          <div className='RootWrapper-links'>
            <Link href='/guide' view={<LinkView />}>Guide</Link>
            <Link href='/examples' view={<LinkView />}>Examples</Link>
            <Link href='/api' view={<LinkView />}>API Reference</Link>
          </div>
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
