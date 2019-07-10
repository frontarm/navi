import * as React from 'react'
import { Navigation, Subscription, Route } from 'navi'
import { HashScroll, HashScrollBehavior } from './HashScroll'
import { NaviContext } from './NaviContext'

export interface NaviProviderProps {
  hashScrollBehavior?: HashScrollBehavior
  navigation: Navigation
}

export namespace NaviProvider {
  export type Props = NaviProviderProps
}

export class NaviProvider extends React.Component<
  NaviProviderProps,
  NaviContext
> {
  subscription?: Subscription

  static getDerivedStateFromProps(
    props: NaviProviderProps,
    state: NaviContext,
  ): NaviContext | null {
    if (state.navigation !== props.navigation) {
      let route = props.navigation.getCurrentValue()

      return route.type === 'busy'
        ? {
            steadyRoute: state.steadyRoute,
            busyRoute: route,
            navigation: props.navigation,
          }
        : {
            steadyRoute: route,
            busyRoute: undefined,
            navigation: props.navigation,
          }
    }
    return null
  }

  constructor(props: NaviProviderProps) {
    super(props)
    this.state = {} as any
  }

  render() {
    return (
      <HashScroll behavior={this.props.hashScrollBehavior}>
        <NaviContext.Provider value={this.state}>
          {this.props.children}
        </NaviContext.Provider>
      </HashScroll>
    )
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
      throw new Error(
        `A <NaviProvider> component must receive a "navigation" prop.`,
      )
    }

    this.subscription = this.props.navigation.subscribe(
      this.handleNavigationSnapshot,
      this.handleError,
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
    } else {
      this.setState({
        busyRoute: route,
      })
    }
  }

  handleError = (error: any) => {
    throw error
  }
}
