import * as React from 'react'
import { History } from 'history'
import { Route, Router, Segment, isSegmentSteady, Status, SegmentType } from 'navi'
import { NavSegment, NavSegmentOutput } from './NavSegment'


export interface NavRouteProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children?: (output: NavRouteOutput) => React.ReactNode
}

export interface NavRouteOutput {
  /**
   * The full route that contains the consumed segment.
   */
  route: Route,
  
  /**
   * The history object
   */
  history: History,

  /**
   * The router
   */
  router: Router,
}

function isFinalSegment(segment: Segment) {
  return segment.status === Status.Busy || segment.type !== SegmentType.Switch
}

function isReady(segment: Segment)  {
  return isSegmentSteady(segment)
}

export namespace NavRoute {
  export type Props = NavRouteProps
  export type Output = NavRouteOutput
}

export class NavRoute extends React.Component<NavRouteProps> {
  render() {
    return (
      <NavSegment
        where={isFinalSegment}
        isReady={isReady}
        children={this.renderChildren}
      />
    )
  }

  renderChildren = (output: NavSegmentOutput): React.ReactNode => {
    let render: undefined | ((props: NavRouteOutput) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (props: NavRouteOutput) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<NavRoute> expects its children to be a function, but instead received "${render}".`)
      }
    }
    else if (output.route && output.route.content) {
      let content = output.route.content
      if (typeof content === 'function') {
        render = output.route.content
      }
      else if (React.isValidElement(content)) {
        return content
      }
    }
    if (!render) {
      throw new Error("<NavRoute> was not able to find a `children` prop, or a `render` function in the consumed segment's `content`.")
    }

    return render(output)
  }
}
