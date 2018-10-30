import * as React from 'react'
import { Anchor } from './Anchor'

export const defaultTheme = {
  render: ({ children }) => children,
  renderSwitch: ({ active, children, title }) => (
    <div
      className={`NaviBar-switch ${active ? 'NaviBar-switch-active' : ''}`}>
      {title && <div className="NaviBar-switch-title">{title}</div>}
      <div className="NaviBar-switch-children">{children}</div>
    </div>
  ),
  renderPage: ({ active, children, title }) => (
    <div className={`NaviBar-page ${active ? 'NaviBar-page-active' : ''}`}>
      <div className="NaviBar-page-link">
        <Anchor>{title}</Anchor>
      </div>
      {children && <div className="NaviBar-page-children">{children}</div>}
    </div>
  ),
  renderHeading: ({ active, children, descendantActive, title }) => (
    <div
      className={`
        NaviBar-heading
        ${active ? 'NaviBar-heading-active' : ''}
        ${descendantActive ? 'NaviBar-heading-descendant-active' : ''}`
      }>
      <div className="NaviBar-heading-link">
        <Anchor>{title}</Anchor>
      </div>
      {children && <div className="NaviBar-heading-children">{children}</div>}
    </div>
  ),
}