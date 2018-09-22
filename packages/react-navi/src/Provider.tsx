import * as React from 'react'
import { Navigation, NavigationState, Subscription } from 'junctions'
import { NavigationContext } from 'react-navi/src/NavigationContext'


interface NavigationProviderProps {
  navigation?: Navigation
  navigationState?: NavigationState
}

interface NavigationProviderState {
  navigationState?: NavigationState
}


export class NavigationProvider extends React.Component<NavigationProviderProps, NavigationProviderState> {
  subscription?: Subscription

  static getDerivedStateFromProps(props: NavigationProviderProps, state: NavigationProviderState = {}) {
    if (props.navigationState) {
      return {
        navigationState: undefined,
      } 
    }
    else if (!state.navigationState) {
      if (!props.navigation) {
        throw new MissingNavigationError
      }
      return {
        navigationState: props.navigation.getState()
      }
    }
    else {
      return null
    }
  }

  render() {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.navigationState && this.props.navigation) {
        console.warn(`A <NavigationProvider> component has received values for both its "navigation" and "navigationState" props. Navi will use the "navigationState" value.`)
      }
    }

    return (
      <NavigationContext.Provider value={(this.props.navigationState || this.state.navigationState)!}>
        {this.props.children}
      </NavigationContext.Provider>
    )
  }

  componentDidMount() {
    if (!this.props.navigationState) {
      this.subscribe()
    }
  }

  componentDidUpdate(prevProps: NavigationProviderProps) {
    if (prevProps.navigationState && !this.props.navigationState) {
      this.subscribe()
    }
    else if (!prevProps.navigationState && this.props.navigationState) {
      this.unsubscribe()
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  subscribe() {
    if (!this.props.navigation) {
      throw new MissingNavigationError
    }

    this.subscription = this.props.navigation.subscribe(
      this.handleNavigationState,
      this.handleError
    )
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      delete this.subscription
    }
  }

  handleNavigationState = (navigationState: NavigationState) => {
    this.setState({
      navigationState
    })
  }

  handleError = (error: any) => {
    throw error
  }
}

export class MissingNavigationError extends Error {
  constructor() {
    super(`A <NavigationProvider> component must receive a "navigation" or "navigationState" prop.`)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}