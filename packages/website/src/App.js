import React from 'react'
import { NavProvider, NavLoading, NavNotFoundBoundary, NavContentSegment } from 'react-navi'
import BusyIndicator from 'react-busy-indicator'


export class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {isLoading =>
            <>
              <BusyIndicator isBusy={isLoading} />
              <NavNotFoundBoundary render={() => <h1>Not Found</h1>}>
                <NavContentSegment />
              </NavNotFoundBoundary>
            </>
          }
        </NavLoading>
      </NavProvider>
    )
  }
}
