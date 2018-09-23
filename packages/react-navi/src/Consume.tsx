import * as React from 'react'
import { RoutingState, Route, RouteStatus, RouteContentStatus, isRouteSteady, NaviError } from 'junctions'
import { NavigationContext } from './NavigationContext'


export interface ConsumeProps {
  /**
   * A render function that will be used to render the selected route.
   */
  children: (output: ConsumeOutput) => React.ReactNode

  /**
   * The first route that matches this will be consumed, along with
   * all routes before it.
   * 
   * By default, looks for a route for a page or branch that defines
   * `getContent()`.
   */
  where?: (route: Route, index: number, unusedRoutes: Route[]) => boolean

  /**
   * A function that indicates whether the route found by `where` is ready
   * to render. Defaults to checking with `isRouteSteady()`.
   */
  isReady?: (route: Route) => boolean

  /**
   * Allows for a delay until the `showBusyIndicator` injected property becomes true.
   * Defaults to 333ms.
   */
  waitingIndicatorDelay?: number
}

export interface ConsumeOutput extends RoutingState {
  /**
   * The route that was matched by the `where` clause (or the previous one if delayed).
   * If the component has just been mounted and it has not yet encountered a ready
   * route, then this will be undefined.
   */
  route?: Route,

  /**
   * An array of all routes from `unusedRoutes` up to and including the matched route
   */
  consumedRoutes: Route[],
  
  /**
   * The history object
   */
  history,

  /**
   * The router
   */
  router,
  
  /**
   * If delayed, and `delayBusyIndicator` milliseconds have passed then it will be true
   * Useful for rendering a loading bar, spinner, etc.
   */
  showWaitingIndicator,
  
  /**
   * If the user has navigated but we haven't resolved all the dependencies yet, then
   * this will be true.
   */
  isWaiting
}

export const Consume: React.SFC<ConsumeProps> = function Consume(props: ConsumeProps) {
  return (
    <NavigationContext.Consumer>
      {context => <InnerConsume {...props} context={context} />}
    </NavigationContext.Consumer>
  )
}
Consume.defaultProps = {
  where: (route: Route) => route.contentStatus !== RouteContentStatus.Unrequested,
  isReady: (route: Route) => isRouteSteady(route),
  waitingIndicatorDelay: 333,
}


interface InnerConsumeProps extends ConsumeProps {
  context: NavigationContext
}

interface InnerConsumeState {
  lastReady?: {
    context: NavigationContext,
    childContext: NavigationContext,
    route: Route,
    usedRoutes: Route[],
  },
  delayedSince?: number,
  indicatingBusySince?: number,
  error?: Error
}

export class InnerConsume extends React.Component<InnerConsumeProps, InnerConsumeState> {
  static getDerivedStateFromProps(props: InnerConsumeProps, state: InnerConsumeState) {
    let unusedRoutes = props.context.unusedRoutes || props.context.routes

    let errorRoute = unusedRoutes.find(route =>
      route.status === RouteStatus.Error ||
      route.contentStatus === RouteContentStatus.Error
    )
    if (errorRoute) {
      return {
        error: errorRoute.error || errorRoute.contentError || new Error("Unknown routing error")
      }
    }

    let index = unusedRoutes.findIndex(props.where!)
    if (index === -1) {
      return {
        error: new MissingRoute(props.context),
      }
    }

    let usedRoutes = unusedRoutes.slice(0, index + 1)
    let route = unusedRoutes[index]
    let isReady = props.isReady!(route)
    let lastReady = state.lastReady

    if (isReady) {
      lastReady = {
        route,
        usedRoutes,
        context: props.context,
        childContext: {
          ...props.context,
          unusedRoutes: usedRoutes.slice(index),
        },
      }
    }

    return {
      lastReady,
      delayedSince: !isReady ? (state.delayedSince || new Date().getTime()) : undefined,
      indicatingBusySince: !isReady ? state.indicatingBusySince : undefined,
    }
  }

  showBusyIndicatorTimeout?: number

  constructor(props: InnerConsumeProps) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: InnerConsumeProps, prevState: InnerConsumeState) {
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
        this.props.waitingIndicatorDelay,
      )
    }

    if (this.state.lastReady && (!prevState.lastReady || prevState.lastReady.context !== this.state.lastReady.context)) {
      this.state.lastReady.context.onRendered()
    }
  }

  componentWillUnmount() {
    if (this.showBusyIndicatorTimeout) {
      window.clearTimeout(this.showBusyIndicatorTimeout)
      delete this.showBusyIndicatorTimeout
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error
    }

    let {
      onRendered,
      unusedRoutes,

      ...routingState
    } = this.props.context

    let output: ConsumeOutput = 
      this.state.lastReady ? ({
        route: this.state.lastReady.route,
        consumedRoutes: this.state.lastReady.usedRoutes,
        showWaitingIndicator: !!this.state.indicatingBusySince,
        isWaiting: !!this.state.delayedSince,

        ...routingState,
      }) : ({
        route: undefined,
        consumedRoutes: [],
        showWaitingIndicator: true,
        isWaiting: true,

        ...routingState,
      })

    return (
      <NavigationContext.Provider value={this.state.lastReady ? this.state.lastReady.childContext : this.props.context}>
        {this.props.children(output)}
      </NavigationContext.Provider>
    )
  }
}


export class MissingRoute extends NaviError {
  context: NavigationContext

  constructor(context: NavigationContext) {
    super(`A <Consume> component attempted to use a route that couldn't be found.`)
    this.context = context
  }
}