import './ExampleWrapper.less'
import React, { Component } from 'react'
import createMemoryHistory from 'history/createMemoryHistory'
import Loader from '../components/Loader'
import FakeBrowser from '../controls/FakeBrowser'
import PrismSourceView from '../views/PrismSourceView'


function ExampleWrapperView({content, error, busy, history}) {
  return (
    error
      ? <div>ERROR: Page content could not be loaded</div>
      : <div className='ExampleWrapper'>
          <h2>Demo</h2>
          <FakeBrowser history={history} busy={busy}>
            {content && React.createElement(content.module.default, { history })}
          </FakeBrowser>
          <h2>Source</h2>
          <PrismSourceView html={content && content.source} busy={busy} />
        </div>
  )
}


export default class ExampleWrapper extends Component {
  componentWillMount() {
    this.handleChangePage({}, this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.handleChangePage(this.props, nextProps)
  }

  handleChangePage(prev, next) {
    if (prev.page != next.page) {
      this.history = createMemoryHistory({
        initialEntries: [ next.page.initialPath || '/' ],
        getUserConfirmation: (message, callback) => {
          callback(window.confirm(message))
        }
      })
    }
  }

  render() {
    return (
      <Loader
        key={this.props.page.id}
        content={this.props.page.content}
        view={<ExampleWrapperView history={this.history} />}
      />
    )
  }
}
