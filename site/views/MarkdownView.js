import './MarkdownView.less'
import React, { Component, PropTypes } from 'react'


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

  componentDidMount() {
    const nodeList = this.refs.html.querySelectorAll("a")
    for (let node of nodeList) {
      const href = node.attributes.href
      if (href && href.value.substr(0, 4) !== 'http' && /[\/a-zA-Z]/.test(href.value[0])) {
        node.onclick = this.handleClickLink
      }
    }
  }

  render() {
    return (
      <div className='MarkdownView' ref='html'>
        <markdown dangerouslySetInnerHTML={{ __html: this.props.html }} />
      </div>
    )
  }
} 
