import * as React from 'react'
import { Helmet } from 'react-helmet'
import { NaviError, Route, Segment, ViewSegment, areURLDescriptorsEqual, HeadSegment, TitleSegment } from 'navi'
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
  where?: (segment: Segment) => boolean
}

export const NavView: React.SFC<NavViewProps> = function NavView(props: NavViewProps) {
  return (
    <NavContext.Consumer>
      {context => <InnerNavView {...props} context={context} />}
    </NavContext.Consumer>
  )
}
NavView.defaultProps = {
  where: (segment: Segment) => segment.type === 'view'
}


interface InnerNavViewProps extends NavViewProps {
  context: NavContext
}

interface InnerNavViewState {
  steadyRoute?: Route,
  childContext?: NavContext,
  segment?: ViewSegment,
  headAndTitleSegments?: (HeadSegment | TitleSegment)[],
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

    let index = unconsumedSegments.findIndex(props.where!)
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

    // Find any unconsumed head content that comes before and after this
    // segment.
    let headAndTitleSegments =
      unconsumedSegments
        .slice(0, index)
        .filter(segment => segment.type === 'title' || segment.type === 'head') as ((HeadSegment | TitleSegment)[])
    for (index += 1; index < unconsumedSegments.length; index++) {
      let segment = unconsumedSegments[index]
      if (segment.type === 'busy' || segment.type === 'error' || props.where!(segment)) {
        break
      }
      if (segment.type === 'title' || segment.type === 'head') {
        headAndTitleSegments.push(segment)
      }
    }

    return {
      segment,
      headAndTitleSegments,
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

    let { segment, headAndTitleSegments } = this.state
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

    let helmet =
      headAndTitleSegments &&
      headAndTitleSegments.length &&
      React.createElement(
        Helmet,
        null,
        ...headAndTitleSegments.map(segment =>
          segment.type === 'title' ? (
            <title>{segment.title}</title>
          ) : ( 
            (segment.head.type === React.Fragment || segment.head.type === 'head')
              ? segment.head.props.children 
              : segment.head
          )
        )
      )
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
        {helmet || null}
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
