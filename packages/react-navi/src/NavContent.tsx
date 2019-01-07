import * as React from 'react'
import { NaviError, Route, Status, Segment, SegmentType } from 'navi'
import { NavContext } from './NavContext'
import { stat } from 'fs';


export interface NavContentProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children?: (content: any, segment: Segment, route: Route) => React.ReactNode

  /**
   * The first segment that matches this will be consumed, along with
   * all segments before it.
   * 
   * By default, looks for a page, a redirect, or a switch with content.
   */
  where?: (segment: Segment, index: number, unconsumedSegments: Segment[]) => boolean
}

export namespace NavContent {
  export type Props = NavContentProps
}

export const NavContent: React.SFC<NavContentProps> = function NavContent(props: NavContentProps) {
  return (
    <NavContext.Consumer>
      {context => <InnerNavContent {...props} context={context} />}
    </NavContext.Consumer>
  )
}
NavContent.defaultProps = {
  where: (segment: Segment) => segment.content || segment.type !== SegmentType.Switch
}


interface InnerNavContentProps extends NavContentProps {
  context: NavContext
}

interface InnerNavContentState {
  steadyRoute?: Route,
  childContext?: NavContext,
  segment?: Segment,
  consumedSegments?: Segment[],
  error?: Error
}

class InnerNavContent extends React.Component<InnerNavContentProps, InnerNavContentState> {
  static getDerivedStateFromProps(props: InnerNavContentProps, state: InnerNavContentState): Partial<InnerNavContentState> | null {
    // If there's no steady route, then we'll need to wait until a steady
    // route becomes available.
    if (!props.context.steadyRoute) {
      return null
    }

    // Bail if nothing has changed
    if (state.steadyRoute === props.context.steadyRoute &&
        state.childContext && state.childContext.busyRoute === props.context.busyRoute) {
      return null
    }

    let unconsumedSegments =
      props.context.unconsumedSteadyRouteSegments ||
      props.context.steadyRoute.segments

    let index = props.where ? unconsumedSegments.findIndex(props.where!) : 0
    let errorSearchSegments = index === -1 ? unconsumedSegments : unconsumedSegments.slice(0, index + 1)
    let errorSegment = errorSearchSegments.find(segment => segment.status === Status.Error)
    if (errorSegment) {
      return {
        error: errorSegment.error || new Error("Unknown routing error")
      }
    }
    if (index === -1) {
      return {
        error: new MissingSegment(props.context),
      }
    }
    let consumedSegments = unconsumedSegments.slice(0, index + 1)
    let segment = unconsumedSegments[index]

    return {
      segment,
      consumedSegments,
      steadyRoute: props.context.steadyRoute,
      childContext: {
        ...props.context,
        busyRoute: props.context.busyRoute,
        unconsumedSteadyRouteSegments: unconsumedSegments.slice(index + 1),
      },
    }
  }

  constructor(props: InnerNavContentProps) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: InnerNavContentProps, prevState: InnerNavContentState) {
    this.handleUpdate(prevState)
  }

  componentDidMount() {
    this.handleUpdate()
  }

  handleUpdate(prevState?: InnerNavContentState) {
    if (this.state.steadyRoute && (!prevState || !prevState.steadyRoute || prevState.steadyRoute !== this.state.steadyRoute)) {
      if (this.props.context.onRendered) {
        this.props.context.onRendered()
      }
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error
    }

    let segment = this.state.segment
    if (!segment) {
      let Suspense: React.ComponentType<any> = (React as any).Suspense
      if (Suspense) {
        throw this.props.context.navigation.steady()
      }
      else {
        console.warn(`A <NavContent> component was rendered before your Navigation store's state had become steady. Consider waiting before rendering with "await navigation.steady()", or upgrading React to version 16.6 to handle this with Suspense.`)
        return null
      }
    }

    let content: React.ReactNode
    let render: undefined | ((content: any, segment: Segment, route: Route) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (content: any, segment: Segment, route: Route) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<NavContent> expects its children to be a function, but instead received "${render}".`)
      }
    }
    else if (segment && segment.content) {
      if (typeof segment.content === 'function') {
        if (segment.content.prototype instanceof React.Component) {
          content = React.createElement(segment.content as any, { segment, route: this.props.context.steadyRoute })
        }
        else {
          render = segment.content
        }
      }
      else if (React.isValidElement(segment.content)) {
        content = segment.content
      }
    }

    if (render) {
      content = render(segment.content, segment, this.props.context.steadyRoute!)
    }
    if (content === undefined) {
      throw new Error("<NavContent> was not able to find a `children` prop, or a `render` function in the consumed RouteSegment's `content`.")
    }

    return (
      <NavContext.Provider value={this.state.childContext!}>
        {
          // Clone the content to force a re-render even if content hasn't
          // changed, as Provider is a PureComponent.
          React.isValidElement(content)
            ? React.cloneElement(content)
            : content
        }
      </NavContext.Provider>
    )
  }
}


export class MissingSegment extends NaviError {
  context: NavContext

  constructor(context: NavContext) {
    super(`A <NavContent> component attempted to use a segment that couldn't be found. This is likely due to its "where" prop.`)
    this.context = context
  }
}