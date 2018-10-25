import React from 'react'
import * as Nav from 'react-navi'
import { AppLayout } from './AppLayout'


export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }

  render() {
    return (
      <Nav.Provider navigation={this.props.navigation}>
        <Nav.Loading>
          {isLoading =>
            <AppLayout
              isBusy={isLoading}
              isMenuOpen={this.state.open}
              onToggleMenu={this.handleToggleMenu}>
              <Nav.NotFoundBoundary render={renderNotFound}>
                <Nav.Content />
              </Nav.NotFoundBoundary>
            </AppLayout>
          }
        </Nav.Loading>
      </Nav.Provider>
    )
  }

  handleToggleMenu = () => {
    this.setState({
      open: !this.state.open
    })
  }

  componentDidMount() {
    // Watch for changes to the current location, and close the
    // nav menu if it is open.
    this.url = this.props.navigation.getCurrentValue().url
    this.props.navigation.subscribe(({ url }) => {
      if (url !== this.url && this.state.open) {
        this.url = url
        this.setState({ open: false })
      }
    })
  }
}


function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 
