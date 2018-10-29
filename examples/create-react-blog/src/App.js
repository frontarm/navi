import React from 'react'
import * as Nav from 'react-navi'


export class App extends React.Component {
  render() {
    return (
      <Nav.Provider navigation={this.props.navigation}>
        <Nav.Loading>
          {isLoading =>
            <>
              <AppBusyIndicator show={isLoading} />
              <nav>
                <Nav.Link href="/">Home</Nav.Link>
              </nav>
              <main>
                <Nav.NotFoundBoundary render={renderNotFound}>
                  <Nav.Route />
                </Nav.NotFoundBoundary>
              </main>
            </>
          }
        </Nav.Loading>
      </Nav.Provider>
    )
  }
}


const AppBusyIndicator = ({ show }) =>
    <div className={`
      App-BusyIndicator
      App-BusyIndicator-${show ? 'loading' : 'done'}
    `} />


function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 
