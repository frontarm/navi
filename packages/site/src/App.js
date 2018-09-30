import React from 'react'
import * as Navi from 'react-navi'
import { AppLayout } from './AppLayout'


export function App(props) {
  return (
    <Navi.Provider navigation={props.navigation}>
      <Navi.Context.Consumer>
        {({ location }) =>
          <InnerApp location={location} />
        }
      </Navi.Context.Consumer>
    </Navi.Provider>
  )
}

class InnerApp extends React.Component {
  state = {
    open: false,
  }

  handleToggleMenu = () => {
    this.setState({ open: !this.state.open })
  }

  render() {
    return (
      <Navi.ConsumeSegment>
        {({ showWaitingIndicator }) =>
          <AppLayout
            isBusy={showWaitingIndicator}
            isMenuOpen={this.state.open}
            onToggleMenu={this.handleToggleMenu}>
            <Navi.NotFoundBoundary render={renderNotFound}>
              <Navi.ConsumeContentSegment />
            </Navi.NotFoundBoundary>
          </AppLayout>
        }
      </Navi.ConsumeSegment>
    )
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location && this.state.open) {
      this.setState({ open: false })
    }
  }
}

function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 
