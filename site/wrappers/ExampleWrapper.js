import './ExampleWrapper.less'
import React, { Component } from 'react'
import { PageContentLoader } from 'sitepack'
import createMemoryHistory from 'history/createMemoryHistory'
import FakeBrowser from '../controls/FakeBrowser'
import PrismSourceView from '../views/PrismSourceView'


function ExampleWrapperView({page, content, error, isLoading, history}) {
  return (
    error
      ? <div>ERROR: Page content could not be loaded</div>
      : <div className='ExampleWrapper'>
          <h2>Demo</h2>
          <FakeBrowser history={history} isLoading={isLoading}>
            {content && React.createElement(content.module.default, { history })}
          </FakeBrowser>
          <h2>Source</h2>
          <PrismSourceView content={content && content.source} isLoading={isLoading} />
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
      <PageContentLoader
        page={this.props.page}
        render={<ExampleWrapperView history={this.history} />}
      />
    )
  }
}
