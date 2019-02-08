import * as React from 'react'
import { Helmet } from 'react-helmet'
import { NaviError, Route, Segment, ViewSegment, areURLDescriptorsEqual } from 'navi'
import { NavContext } from './NavContext'
import { scrollToHash } from './scrollToHash'


export interface NavViewProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children?: (view: any, route: Route) => React.ReactNode

  disableScrolling?: boolean
  hashScrollBehavior?: 'smooth' | 'instant'

  /**
   * The first segment that matches this will be consumed, along with
   * all segments before it.
   * 
   * By default, looks for a page, a redirect, or a switch with content.
   */
  where?: (segment: Segment, index: number, unconsumedSegments: Segment[]) => boolean
}

export const NavView: React.SFC<NavViewProps> = function NavView(props: NavViewProps) {
  return (
    <NavContext.Consumer>
      {context => <InnerNavView {...props} context={context} />}
    </NavContext.Consumer>
  )
}
NavView.defaultProps = {
  where: (segment: Segment) => segment.type === 'view' && !getHeadContent(segment)
}


interface InnerNavViewProps extends NavViewProps {
  context: NavContext
}

interface InnerNavViewState {
  steadyRoute?: Route,
  childContext?: NavContext,
  segment?: ViewSegment,
  headViews?: React.ReactNode[],
  error?: Error
}

class InnerNavView extends React.Component<InnerNavViewProps, InnerNavViewState> {
  static getDerivedStateFromProps(props: InnerNavViewProps, state: InnerNavViewState): Partial<InnerNavViewState> | null {
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
    let errorSegment = errorSearchSegments.find(segment => segment.type === 'error')
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
    let segment = unconsumedSegments[index] as ViewSegment

    // Find any head content that comes after this segment and before a busy
    // or error segment
    let headViews: React.ReactNode[] = unconsumedSegments.slice(0, index).map(getHeadContent).filter(x => !!x)
    for (index += 1; index < unconsumedSegments.length; index++) {
      let segment = unconsumedSegments[index]
      if (segment.type === 'busy' || segment.type === 'error') {
        break
      }
      if (segment.type === 'view') {
        let headView = getHeadContent(segment)
        if (headView) {
          headViews.push(headView)
        }
        else {
          break
        }
      }
    }

    if (props.context.steadyRoute.title) {
      headViews.unshift(<title>{props.context.steadyRoute.title}</title>)
    }

    return {
      segment,
      headViews: headViews.map((view: any) => view.type === "title" ? <title>{view.props.children}</title> : view),
      steadyRoute: props.context.steadyRoute,
      childContext: {
        ...props.context,
        busyRoute: props.context.busyRoute,
        unconsumedSteadyRouteSegments: unconsumedSegments.slice(index),
      },
    }
  }

  constructor(props: InnerNavViewProps) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: InnerNavViewProps, prevState: InnerNavViewState) {
    this.handleUpdate(prevState)
  }

  componentDidMount() {
    this.handleUpdate()
  }

  handleUpdate(prevState?: InnerNavViewState) {
    if (this.state.steadyRoute && (!prevState || !prevState.steadyRoute || prevState.steadyRoute !== this.state.steadyRoute)) {
      let prevRoute = prevState && prevState.steadyRoute
      let nextRoute = this.state.steadyRoute

      if (nextRoute && nextRoute.type !== 'busy') {
        if (prevRoute && areURLDescriptorsEqual(nextRoute.url, prevRoute.url)) {
          return
        }

        if (!this.props.disableScrolling &&
          (!prevRoute ||
          !prevRoute.url ||
          prevRoute.url.hash !== nextRoute.url.hash ||
          prevRoute.url.pathname !== nextRoute.url.pathname)
        ) {
          scrollToHash(
              nextRoute.url.hash,
              prevRoute && prevRoute.url && prevRoute.url.pathname === nextRoute.url.pathname
                  ? this.props.hashScrollBehavior
                  : 'instant'
          )
        }
      }
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error
    }

    let { segment, headViews } = this.state
    if (!segment || !segment.view) {
      let Suspense: React.ComponentType<any> = (React as any).Suspense
      if (Suspense) {
        throw this.props.context.navigation.steady()
      }
      else {
        console.warn(`A <NavView> component was rendered before your Navigation store's state had become steady. Consider waiting before rendering with "await navigation.steady()", or upgrading React to version 16.6 to handle this with Suspense.`)
        return null
      }
    }

    let helmet = (headViews && headViews.length)
      ? React.createElement(Helmet, null, ...headViews)
      : null
    let content: React.ReactNode
    
    let render: undefined | ((view: any, route: Route) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (view: any, route: Route) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<NavView> expects its children to be a function, but instead received "${render}".`)
      }
      content = this.props.children(segment.view, this.state.steadyRoute!)
    }
    else if (segment.view) {
      if (typeof segment.view === 'function') {
        content = React.createElement(segment.view, { route: this.props.context.steadyRoute })
      }
      else if (typeof segment.view === 'string' || React.isValidElement(segment.view)) {
        content = segment.view
      }
    }
    else {
      throw new Error("<NavView> was not able to find a `children` prop, and was unable to find any body or head content in the consumed Route segment's `content`.")
    }

    return (
      <NavContext.Provider value={this.state.childContext!}>
        {helmet}
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
    super(`A <NavView> component attempted to use a segment that couldn't be found. This is likely due to its "where" prop.`)
    this.context = context
  }
}

function getHeadContent(segment): React.ReactNode {
  let type = segment && segment.view && segment.view.type
  if (type === 'head') {
    return segment.view.props.children
  }
  else if (type === 'title' || type === 'link' || type === 'style' || type === 'meta') {
    return segment.view
  }
}