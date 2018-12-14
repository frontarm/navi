import * as React from 'react'
import { Navigation, NavigationSnapshot, Subscription, NaviError } from 'navi'
import { NavContext } from './NavContext'


export interface NavProviderProps {
  navigation?: Navigation
  navigationSnapshot?: NavigationSnapshot
}

export interface NavProviderState {
  navigationSnapshot?: NavigationSnapshot
}

export namespace NavProvider {
  export type Props = NavProviderProps
}

export class NavProvider extends React.Component<NavProviderProps, NavProviderState> {
  subscription?: Subscription

  static getDerivedStateFromProps(props: NavProviderProps, state: NavProviderState): null | Partial<NavProviderState> {
    if (props.navigationSnapshot) {
      return {
        navigationSnapshot: undefined,
      } 
    }
    else if (!state.navigationSnapshot) {
      if (!props.navigation) {
        throw new MissingNavigationError
      }
      return {
        navigationSnapshot: props.navigation.getCurrentValue()
      }
    }
    else {
      return null
    }
  }

  constructor(props: NavProviderProps) {
    super(props)
    this.state = {}
  }

  render() {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.navigationSnapshot && this.props.navigation) {
        console.warn(`A <NavProvider> component has received values for both its "navigation" and "navigationSnapshot" props. Navi will use the "navigationSnapshot" value.`)
      }
    }

    return (
      <NavContext.Provider value={(this.props.navigationSnapshot || this.state.navigationSnapshot)!}>
        {this.props.children}
      </NavContext.Provider>
    )
  }

  componentDidMount() {
    if (!this.props.navigationSnapshot) {
      this.subscribe()
    }
  }

  componentDidUpdate(prevProps: NavProviderProps) {
    if (prevProps.navigationSnapshot && !this.props.navigationSnapshot) {
      this.subscribe()
    }
    else if (!prevProps.navigationSnapshot && this.props.navigationSnapshot) {
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
      this.handleNavigationSnapshot,
      this.handleError
    )
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      delete this.subscription
    }
  }

  handleNavigationSnapshot = (navigationSnapshot: NavigationSnapshot) => {
    this.setState({
      navigationSnapshot
    })
  }

  handleError = (error: any) => {
    throw error
  }
}

export class MissingNavigationError extends NaviError {
  constructor() {
    super(`A <NavProvider> component must receive a "navigation" or "navigationSnapshot" prop.`)
  }
}