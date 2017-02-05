import React, { Component, PropTypes } from 'react'
import createMemoryHistory from 'history/createMemoryHistory'
import FakeBrowser from '../controls/FakeBrowser'
import PrismSourceView from '../views/PrismSourceView'


function ComponentExampleView({page, content, error, isLoading, history}) {
  console.log(content)

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


export default class ComponentExample extends Component {
  componentWillMount() {
    this.handleChangePage({}, this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.handleChangePage(this.props, nextProps)
  }

  handleChangePage(prev, next) {
    if (prev.example != next.example) {
      this.history = createMemoryHistory({
        initialEntries: [ '/' ],
        getUserConfirmation: (message, callback) => {
          callback(window.confirm(message))
        }
      })
    }
  }

  render() {
    return <ComponentExampleView history={this.history} content={this.props.example} />
  }
}
