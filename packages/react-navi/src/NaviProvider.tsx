import * as React from 'react'
import { Navigation, NavigationSnapshot, Subscription, NaviError } from 'junctions'
import { NaviContext } from './NaviContext'


export interface NaviProviderProps {
  navigation?: Navigation
  navigationSnapshot?: NavigationSnapshot
}

export interface NaviProviderState {
  navigationSnapshot?: NavigationSnapshot
}

export class NaviProvider extends React.Component<NaviProviderProps, NaviProviderState> {
  subscription?: Subscription

  static getDerivedStateFromProps(props: NaviProviderProps, state: NaviProviderState): null | Partial<NaviProviderState> {
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
        navigationSnapshot: props.navigation.getSnapshot()
      }
    }
    else {
      return null
    }
  }

  constructor(props: NaviProviderProps) {
    super(props)
    this.state = {}
  }

  render() {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.navigationSnapshot && this.props.navigation) {
        console.warn(`A <Navi.Provider> component has received values for both its "navigation" and "navigationSnapshot" props. Navi will use the "navigationSnapshot" value.`)
      }
    }

    return (
      <NaviContext.Provider value={(this.props.navigationSnapshot || this.state.navigationSnapshot)!}>
        {this.props.children}
      </NaviContext.Provider>
    )
  }

  componentDidMount() {
    if (!this.props.navigationSnapshot) {
      this.subscribe()
    }
  }

  componentDidUpdate(prevProps: NaviProviderProps) {
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
    super(`A <Navi.Provider> component must receive a "navigation" or "navigationSnapshot" prop.`)
  }
}