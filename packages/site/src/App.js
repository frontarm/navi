import React from 'react'
import * as Navi from 'react-navi'
import { MDXWrapper } from './MDXWrapper'
import { Sidebar } from './Sidebar'
import './App.css'


export function App(props) {
  return (
    <Navi.Provider navigation={props.navigation}>
      <Navi.History>
        {history => <AppContent location={history.location} />}
      </Navi.History>
    </Navi.Provider>
  )
}


function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 

function renderUnresolvable() {
  return (
    <div className='App-error'>
      <h1>Oh shit something went wrong.</h1>
    </div>
  )
}


const AppBusyIndicator = ({ show }) =>
    <div className={`
        App-LoadingIndicator
        App-LoadingIndicator-${show ? 'loading' : 'done'}
    `} />

class AppContent extends React.Component {
  state = {
    open: false,
  }

  handleToggleMenu = () => {
    this.setState({ open: !this.state.open })
  }

  render() {
    return (
      <div className="App">
        <div className={`App-nav ${this.state.open ? 'App-nav-open' : ''}`}>
          <Sidebar className='App-nav-sidebar' />
          <button
            className='App-nav-hamburger'
            onClick={this.handleToggleMenu}>
            <div className='App-nav-hamburger-icon' />
          </button>
        </div>

        <main className="App-content">
          <Navi.ErrorBoundary
            renderNotFound={renderNotFound}
            renderUnresolvable={renderUnresolvable}
          >
            <Navi.Consume>
              {({ route, showWaitingIndicator }) =>
                <React.Fragment>
                  <AppBusyIndicator show={showWaitingIndicator} />
                  {route && <MDXWrapper route={route} />}
                </React.Fragment>
              }
            </Navi.Consume>
          </Navi.ErrorBoundary>
        </main>
      </div>
    )
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location && this.state.open) {
      this.setState({ open: false })
    }
  }
}

