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
      if (href && href.value.indexOf('://') === -1 && href[0] !== '#') {
        node.onclick = this.handleClickLink
      }
    }
  }

  componentDidMount() {
    this.setupLinks()

    const hash = this.props.hash
    if (hash && !this.props.isLoading) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView(true);
      }
    }
    else {
      window.scroll(0, 0)
    }
  }

  componentDidUpdate(prevProps) {
    this.setupLinks()

    const hash = this.props.hash
    if (hash &&
        (prevProps.hash !== hash ||
        prevProps.isLoading && !this.props.isLoading)) {

      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView(true);
      }
      else {
        window.scroll(0, 0)
      }
    }
  }

  render() {
    return (
      <div className='MarkdownView' ref='html'>
        <CommunicationStateView
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
        <markdown dangerouslySetInnerHTML={{ __html: this.props.content }} />
      </div>
    )
  }
} 
