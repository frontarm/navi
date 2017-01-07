import './BrowserView.less'
import React, { cloneElement } from 'react'


const BrowserButtonView = ({ element, children }) =>
  cloneElement(element, {
    ...element.props,
    className: 'BrowserView-button'
  }, children)

const BrowserInputView = ({ element }) =>
  cloneElement(element, {
    ...element.props,
    className: 'BrowserView-input'
  })


const BrowserView = ({
  className,
  style,
  busy,

  backControl,
  forwardControl,
  urlControl,

  children
}) => 
  <div className={`BrowserView ${className}`} style={style}>
    <div className='BrowserView-toolbar'>
      {cloneElement(backControl, { ...backControl.props, view: <BrowserButtonView /> }, '<')}
      {cloneElement(forwardControl, { ...forwardControl.props, view: <BrowserButtonView /> }, '>')}
      {cloneElement(urlControl, { ...urlControl.props, view: <BrowserInputView /> })}
    </div>
    <div className='BrowserView-content'>
      {children}
    </div>
  </div>


export default BrowserView
