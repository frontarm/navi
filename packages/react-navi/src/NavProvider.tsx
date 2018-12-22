import * as React from 'react'
import { Navigation, NavigationSnapshot, Subscription, NaviError, Status, Route } from 'navi'
import { NavContext } from './NavContext'


export interface NavProviderProps {
  navigation: Navigation
}

export interface NavProviderState {
  navigation: Navigation

  steadyRoute?: Route
  busyRoute?: Route
}

export namespace NavProvider {
  export type Props = NavProviderProps
}

export class NavProvider extends React.Component<NavProviderProps, NavProviderState> {
  subscription?: Subscription

  static getDerivedStateFromProps(props: NavProviderProps, state: NavProviderState): NavProviderState | null {
    if (state.navigation !== props.navigation) {
      let route = props.navigation.getCurrentValue().route

      return (
        (!route.isSteady)
          ? { steadyRoute: undefined, busyRoute: route, navigation: props.navigation }
          : { steadyRoute: route, busyRoute: undefined, navigation: props.navigation }
      )
    }
    return null
  }

  constructor(props: NavProviderProps) {
    super(props)
    this.state = {} as any
  }

  render() {
    let context = {
      ...this.state,

      history: this.props.navigation.history,
      router: this.props.navigation.router,

      onRendered: this.props.navigation.getCurrentValue().onRendered,
    }
    
    let result = (
      <NavContext.Provider value={context}>
        {this.props.children}
      </NavContext.Provider>
    )

    // If <Suspense> is supported, wrap one around the application so that
    // it doesn't have to be manually added, given that there's still not
    // a huge amount of awareness around it
    //
    // When server rendered suspense is released, this will need to be
    // removed.
    let Suspense: React.ComponentType<any> = (React as any).Suspense
    if (Suspense) {
      result = <Suspense fallback={null}>{result}</Suspense>
    }

    return result
  }

  componentDidMount() {
    this.subscribe()
  }

  componentDidUpdate(prevProps: NavProviderProps) {
    if (prevProps.navigation !== this.props.navigation) {
      this.unsubscribe()
      this.subscribe()
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  subscribe() {
    if (!this.props.navigation) {
      throw new Error(`A <NavProvider> component must receive a "navigation" prop.`)
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

  handleNavigationSnapshot = ({ route }: NavigationSnapshot) => {
    if (route.isSteady) {
      this.setState({
        steadyRoute: route,
        busyRoute: undefined,
      })
    }
    else {
      this.setState({
        busyRoute: route,
      })
    }
  }

  handleError = (error: any) => {
    throw error
  }
}
