import * as React from 'react'
import { RoutingState, Route, RouteContentStatus, isRouteSteady } from 'junctions'
import { NavigationContext } from './NavigationContext'


export interface UseRouteProps {
  /**
   * A render function that will be used to render the selected route.
   */
  children: (output: UseRouteOutput) => React.ReactNode

  /**
   * Defaults to picking the first thing with defined content.
   */
   where?: (route: Route, index: number, unusedRoutes: Route[]) => boolean

  /**
   * A function that indicates whether the route found by `where` is ready
   * to render. Defaults to checking with `isRouteSteady()`.
   * Defaults to delaying updates until they're ready.
   */
  delayUntil?: (route: Route) => boolean

  /**
   * Allows for a delay until the `showBusyIndicator` injected property becomes true.
   * Defaults to 333ms.
   */
  delayBusyIndicator?: number
}

export interface UseRouteOutput extends RoutingState {
  /**
   * The route that was matched by the `where` clause (or the previous one if delayed)
   */
  route: Route,

  /**
   * An array of all routes from `unusedRoutes` up to and including the matched route
   */
  usedRoutes: Route[],
  
  /**
   * The latest history object, even if delayed
   */
  history,

  /**
   * The router (should never be used really)
   */
  router,
  
  /**
   * If delayed, and `delayBusyIndicator` milliseconds have passed then it will be true
   * Useful for rendering a loading bar, spinner, etc.
   */
  showBusyIndicator,
  
  /**
   * If the user has navigated but we haven't resolved all the dependencies yet, then
   * this will be true.
   */
  isDelayed
}

export const UseRoute: React.SFC<UseRouteProps> = function UseRoute(props: UseRouteProps) {
  return (
    <NavigationContext.Consumer>
      {context => <InnerUseRoute {...props} context={context} />}
    </NavigationContext.Consumer>
  )
}

UseRoute.defaultProps = {
  where: (route: Route) => route.contentStatus !== RouteContentStatus.Unrequested,
  delayUntil: (route: Route) => isRouteSteady(route),
  delayBusyIndicator: 333,
}


interface InnerUseRouteProps extends UseRouteProps {
  context: NavigationContext
}

interface InnerUseRouteState {
  lastReady: {
    childContext: NavigationContext,
    route: Route,
    usedRoutes: Route[],
  },
  delayedSince?: number,
  indicatingBusySince?: number,
  notFound: boolean
}

export class InnerUseRoute extends React.Component<InnerUseRouteProps, InnerUseRouteState> {
  static getDerivedStateFromProps(props: InnerUseRouteProps, state: InnerUseRouteState) {
    let unusedRoutes = props.context.unusedRoutes || props.context.routes
    let index = unusedRoutes.findIndex(props.where!)

    if (index === -1) {
      return {
        notFound: true,
      }
    }

    let usedRoutes = unusedRoutes.slice(0, index + 1)
    let route = unusedRoutes[index]
    let isReady = props.delayUntil!(route)
    let navigatingSince = isReady ? (state.delayedSince || new Date().getTime()) : undefined
    let lastReady = state.lastReady

    if (isReady) {
      lastReady = {
        route,
        usedRoutes,
        childContext: {
          ...props.context,
          unusedRoutes: usedRoutes.slice(index),
        }
      }
    }

    return {
      notFound: false,
      lastReady,
      navigatingSince,
      indicatingBusySince: isReady ? state.indicatingBusySince : undefined,
    }
  }

  showBusyIndicatorTimeout?: number

  componentDidUpdate(prevProps: InnerUseRouteProps, prevState: InnerUseRouteState) {
    // Delay showing the loading bar for a little, so that we don't show and
    // then immediately hide the loading bar.
    let { delayedSince, indicatingBusySince } = this.state
    if (delayedSince && !indicatingBusySince && !this.showBusyIndicatorTimeout) {
      this.showBusyIndicatorTimeout = window.setTimeout(
        () => {
          delete this.showBusyIndicatorTimeout
          if (this.state.delayedSince === delayedSince) {
            this.setState({
              indicatingBusySince: new Date().getTime()
            })
          }
        },
        this.props.delayBusyIndicator,
      )
    }
  }

  componentWillUnmount() {
    if (this.showBusyIndicatorTimeout) {
      window.clearTimeout(this.showBusyIndicatorTimeout)
      delete this.showBusyIndicatorTimeout
    }
  }

  render() {
    if (this.state.notFound) {
      throw new Error("Route not found")
    }

    let {
      onRendered,
      unusedRoutes,

      ...routingState
    } = this.props.context

    let output: UseRouteOutput = {
      route: this.state.lastReady.route,
      usedRoutes: this.state.lastReady.usedRoutes,
      showBusyIndicator: !!this.state.indicatingBusySince,
      isDelayed: !!this.state.delayedSince,

      ...routingState,
    }

    return (
      <NavigationContext.Provider value={this.state.lastReady.childContext}>
        {this.props.children(output)}
      </NavigationContext.Provider>
    )
  }
}