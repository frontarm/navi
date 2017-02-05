import './MarkdownView.less'
import React, { Component, PropTypes } from 'react'
import CommunicationStateView from './CommunicationStateView'
import Link from '../controls/Link'


export default class MarkdownView extends Component {
  componentDidMount() {
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
      <div className='MarkdownView'>
        <CommunicationStateView
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
        {this.props.content
          ? React.createElement(this.props.content, {
              factories: {
                a: React.createFactory(Link)
              }
            })
          : <div />}
      </div>
    )
  }
} 
