import './MarkdownView.less'
import React, { Component, PropTypes } from 'react'
import CommunicationStateView from './CommunicationStateView'
import { resolve } from 'path'


function isLeftClickEvent(event) {
  return event.button === 0
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}


export default class MarkdownView extends Component {
  handleClickLink = (e) => {
    if (
      event.defaultPrevented ||
      isModifiedEvent(event) ||
      !isLeftClickEvent(event) ||
      e.target.attributes.target ||
      !this.props.onClickLink
    ) {
      return
    }

    e.preventDefault()
    this.props.onClickLink(e.target.attributes.href.value)
  }

  setupLinks() {
    const nodeList = this.refs.html.querySelectorAll("a")
    for (let node of nodeList) {
      const href = node.attributes.href
      if (href && href.value.substr(0, 4) !== 'http' && /[\.\/a-zA-Z]/.test(href.value[0])) {
        node.onclick = this.handleClickLink
      }
    }
  }

  componentDidMount() {
    this.setupLinks()
  }

  componentDidUpdate() {
    this.setupLinks()
  }

  render() {
    let html = this.props.content
    if (html) {
      let parts = html.split(/%SITEPACK_LINK|END_SITEPACK_LINK%/)
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        if (part[0] == '%' && part[part.length - 1] == '%') {
          part = part.substr(1, part.length-2)
          if (part[0] === '#' || part.substr(0, 4) === 'http') {
            parts[i] = part
            continue
          }
          const [path, hash] = part.split('#')
          let absolutePath =
            path[0] === '/'
              ? path
              : resolve(this.props.currentLocation.pathname, '..', path)
          absolutePath = absolutePath.replace(/\.[a-zA-Z]+$/, '')
          if (hash) absolutePath += '#'+hash
          parts[i] = absolutePath
        }
      }
      html = parts.join('')
    }

    return (
      <div className='MarkdownView' ref='html'>
        <h1>
          <a className="header-anchor" href="#top" aria-hidden="true">#</a>
          {this.props.title}
        </h1>
        <CommunicationStateView
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
        <markdown dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }
} 
