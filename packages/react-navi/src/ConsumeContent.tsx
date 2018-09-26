import * as React from 'react'
import { RoutingState, Route, RouteStatus, RouteContentStatus, isRouteSteady, NaviError } from 'junctions'
import { Consume, ConsumeOutput } from './Consume'


export interface ConsumeContentProps {
  /**
   * A render function that will be used to render the selected route.
   */
  children?: (output: ConsumeOutput) => React.ReactNode

  /**
   * A function that indicates whether the first unconsumed route is ready
   * to be traversed. Defaults to checking with `isRouteSteady()`.
   */
  isReady?: (route: Route) => boolean

  /**
   * Allows for a delay until the `showBusyIndicator` injected property becomes true.
   * Defaults to 333ms.
   */
  waitingIndicatorDelay?: number
}

function doesRouteDefineContent(route: Route) {
  return route.contentStatus !== RouteContentStatus.Unrequested
}

export class ConsumeContent extends React.Component<ConsumeContentProps> {
  static defaultProps = {
    isReady: (route: Route) => isRouteSteady(route),
    waitingIndicatorDelay: 333,
  }

  render() {
    return (
      <Consume
        where={doesRouteDefineContent}
        isReady={this.props.isReady}
        waitingIndicatorDelay={this.props.waitingIndicatorDelay}
        children={this.renderChildren}
      />
    )
  }

  renderChildren = (output: ConsumeOutput): React.ReactNode => {
    let render: undefined | ((props: ConsumeOutput) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (props: ConsumeOutput) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<Navi.Consume> expects its children to be a function, but instead received "${render}".`)
      }
    }
    else if (output.route && output.route.content) {
      let content = output.route.content
      if (typeof content === 'function') {
        render = output.route.content
      }
      else if (React.isValidElement(content)) {
        render = () => content
      }
    }
    if (!render) {
      throw new Error("<Navi.Consume> was not able to find a `children` prop, or a `render` function in the consumed route's `content`.")
    }

    return render(output)
  }
}
