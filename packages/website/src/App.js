import React from 'react'
import * as Nav from 'react-navi'
import { AppLayout } from './AppLayout'
import { MDXWrapper } from './MDXWrapper';


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
            <Nav.NotFoundBoundary render={() =>
              <NotFound
                isBusy={isLoading}
                isMenuOpen={this.state.open}
                pageMap={this.props.pageMap}
                onToggleMenu={this.handleToggleMenu}
              />
            }>
              <Nav.Route>
                {({ route }) => {
                  let tableOfContents =
                    route.content &&
                    route.content.tableOfContents &&
                    route.content.tableOfContents()

                  return (
                    <AppLayout
                      isBusy={isLoading}
                      isMenuOpen={this.state.open}
                      pageMap={this.props.pageMap}
                      tableOfContents={tableOfContents}
                      onToggleMenu={this.handleToggleMenu}>
                      <MDXWrapper document={route.content.Document} />
                    </AppLayout>
                  )
                }}
              </Nav.Route>
            </Nav.NotFoundBoundary>
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


function NotFound(props) {
  return (
    <AppLayout
      isBusy={props.isLoading}
      isMenuOpen={props.isMenuOpen}
      pageMap={props.pageMap}
      onToggleMenu={props.onToggleMenu}>
      <div className='App-error'>
        <h1>404 - Not Found</h1>
      </div>
    </AppLayout>
  )
} 
