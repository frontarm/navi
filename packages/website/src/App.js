import React from 'react'
import * as Nav from 'react-navi'
import { AppLayout } from './AppLayout'
import { MDXWrapper } from './MDXWrapper';


export class App extends React.Component {
  render() {
    return (
      <Nav.Provider navigation={this.props.navigation}>
        <Nav.Loading>
          {isLoading =>
            <Nav.NotFoundBoundary render={() =>
              <NotFound
                isBusy={isLoading}
                pageMap={this.props.pageMap}
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
                      pageMap={this.props.pageMap}
                      tableOfContents={tableOfContents}>
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
}


function NotFound(props) {
  return (
    <AppLayout
      isBusy={props.isLoading}
      pageMap={props.pageMap}>
      <div className='App-error'>
        <h1>404 - Not Found</h1>
      </div>
    </AppLayout>
  )
} 
