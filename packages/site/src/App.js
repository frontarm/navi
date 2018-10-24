import React from 'react'
import * as Nav from 'react-navi'
import { AppLayout } from './AppLayout'


export function App(props) {
  return (
    <Nav.Provider navigation={props.navigation}>
      <Nav.Consumer>
        {({ location }) =>
          <InnerApp location={location} />
        }
      </Nav.Consumer>
    </Nav.Provider>
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
      <Nav.Loading>
        {isLoading =>
          <AppLayout
            isBusy={isLoading}
            isMenuOpen={this.state.open}
            onToggleMenu={this.handleToggleMenu}>
            <Nav.NotFoundBoundary render={renderNotFound}>
              <Nav.ContentSegment />
            </Nav.NotFoundBoundary>
          </AppLayout>
        }
      </Nav.Loading>
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
