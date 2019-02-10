import * as React from 'react'
import { BrowserNavigation, Navigation, Subscription, Route } from 'navi'
import { NaviContext } from './NaviContext'

export interface NaviProviderProps {
  navigation: Navigation

  /**
   * Navi will attempt to detect a non browser environment in order to
   * prevent rendering of <Suspense>, but if it fails, you can manually
   * set `fallback` to `undefined`.
   */
  fallback?: React.ReactNode | undefined
}

export interface NaviProviderState {
  navigation: Navigation

  steadyRoute?: Route
  busyRoute?: Route
}

export namespace NaviProvider {
  export type Props = NaviProviderProps
}

export class NaviProvider extends React.Component<NaviProviderProps, NaviProviderState> {
  subscription?: Subscription

  static getDerivedStateFromProps(props: NaviProviderProps, state: NaviProviderState): NaviProviderState | null {
    if (state.navigation !== props.navigation) {
      let route = props.navigation.getCurrentValue()

      return (
        (route.type === 'busy')
          ? { steadyRoute: state.steadyRoute, busyRoute: route, navigation: props.navigation }
          : { steadyRoute: route, busyRoute: undefined, navigation: props.navigation }
      )
    }
    return null
  }

  constructor(props: NaviProviderProps) {
    super(props)
    this.state = {} as any
  }

  render() {
    let context = this.state
    let result = (
      <NaviContext.Provider value={context}>
        {this.props.children}
      </NaviContext.Provider>
    )

    // If <Suspense> is supported and the app is being rendered in a browser,
    // then wrap the app with a <Suspense> with an empty fallback, so that
    // the fallback doesn't need to be provided manually.
    let Suspense: React.ComponentType<any> = (React as any).Suspense
    if (Suspense) {
      let fallback = this.props.fallback
      if (!('fallback' in this.props) && this.props.navigation instanceof BrowserNavigation) {
        fallback = null
      }
      if (fallback !== undefined) {
        result = <Suspense fallback={fallback}>{result}</Suspense>
      }
    }
    else if (this.props.fallback !== undefined) {
      console.warn(`You supplied a "fallback" prop to your <NaviProvider>, but the version of React that you're using doesn't support Suspense. To use the "fallback" prop, upgrade to React 16.6 or later.`)
    }

    return result
  }

  componentDidMount() {
    this.subscribe()
  }

  componentDidUpdate(prevProps: NaviProviderProps) {
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
      throw new Error(`A <NaviProvider> component must receive a "navigation" prop.`)
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

  handleNavigationSnapshot = (route: Route) => {
    if (route.type !== 'busy') {
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
