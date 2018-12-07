import React from 'react'
import { NavProvider, NavLoading, NavNotFoundBoundary, NavRoute } from 'react-navi'
import { AppLayout } from './AppLayout'
import { MDXWrapper } from './MDXWrapper';


export class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {isLoading =>
            <NavNotFoundBoundary render={() =>
              <NotFound
                isBusy={isLoading}
                pageMap={this.props.siteMap.pages}
              />
            }>
              <NavRoute>
                {route => {
                  let tableOfContents =
                    route.content &&
                    route.content.tableOfContents &&
                    route.content.tableOfContents()

                  return (
                    <AppLayout
                      isBusy={isLoading}
                      pageMap={this.props.siteMap.pages}
                      tableOfContents={tableOfContents}>
                      <MDXWrapper document={route.content.Document} />
                    </AppLayout>
                  )
                }}
              </NavRoute>
            </NavNotFoundBoundary>
          }
        </NavLoading>
      </NavProvider>
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
