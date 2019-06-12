import * as React from 'react'
import { Helmet } from 'react-helmet'
import { NaviError, Route, Chunk, ViewChunk, HeadChunk, TitleChunk } from 'navi'
import { HashScrollContext, HashScrollBehavior, scrollToHash } from './HashScroll'
import { NaviContext } from './NaviContext'


export interface ViewProps {
  /**
   * A render function that will be used to render the selected Chunk.
   */
  children?: (view: any, route: Route) => React.ReactNode

  disableScrolling?: boolean
  hashScrollBehavior?: HashScrollBehavior

  /**
   * The first Chunk that matches this will be consumed, along with
   * all Chunks before it.
   * 
   * By default, looks for a page, a redirect, or a switch with content.
   */
  where?: (Chunk: Chunk) => boolean
}

export const View: React.SFC<ViewProps> = function View(props: ViewProps) {
  return (
    <HashScrollContext.Consumer>
      {hashScrollBehavior =>
        <NaviContext.Consumer>
          {context => <InnerView {...props} context={context} hashScrollBehavior={props.hashScrollBehavior || hashScrollBehavior} />}
        </NaviContext.Consumer>
      }
    </HashScrollContext.Consumer>
  )
}
View.defaultProps = {
  where: (Chunk: Chunk) => Chunk.type === 'view'
}


interface InnerViewProps extends ViewProps {
  context: NaviContext
}

interface InnerViewState {
  route?: Route,
  childContext?: NaviContext,
  Chunk?: ViewChunk,
  headAndTitleChunks?: (HeadChunk | TitleChunk)[],
  error?: Error
}

// Memoize these to stop a bizarre react-helmet infinite loop bug when titles
// are recreated on each render
const titles = {} as { [name: string]: React.ReactNode }
function createTitleElement(str: string) {
  let title = titles[str]
  if (!title) {
    title = titles[str] = <title>{str}</title>
  }
  return title
}

class InnerView extends React.Component<InnerViewProps, InnerViewState> {
  static getDerivedStateFromProps(props: InnerViewProps, state: InnerViewState): Partial<InnerViewState> | null {
    let route = props.context.steadyRoute || props.context.busyRoute

    // If there's no steady route, then we'll need to wait until a steady
    // route becomes available.
    if (!route) {
      return null
    }

    // Bail if nothing has changed
    if (state.route === route &&
        state.childContext && state.childContext.busyRoute === props.context.busyRoute) {
      return null
    }

    let unconsumedChunks =
      props.context.unconsumedSteadyRouteChunks ||
      route.chunks

    let index = unconsumedChunks.findIndex(props.where!)
    let errorSearchChunks = index === -1 ? unconsumedChunks : unconsumedChunks.slice(0, index + 1)
    let errorChunk = errorSearchChunks.find(Chunk => Chunk.type === 'error')
    if (errorChunk) {
      return {
        error: errorChunk.error || new Error("Unknown routing error")
      }
    }
    if (index === -1) {
      return null
    }
    let Chunk = unconsumedChunks[index] as ViewChunk

    // Find any unconsumed head content that comes before and after this
    // Chunk.
    let headAndTitleChunks =
      unconsumedChunks
        .slice(0, index)
        .filter(Chunk => Chunk.type === 'title' || Chunk.type === 'head') as ((HeadChunk | TitleChunk)[])
    for (index += 1; index < unconsumedChunks.length; index++) {
      let Chunk = unconsumedChunks[index]
      if (Chunk.type === 'busy' || Chunk.type === 'error' || props.where!(Chunk)) {
        break
      }
      if (Chunk.type === 'title' || Chunk.type === 'head') {
        headAndTitleChunks.push(Chunk)
      }
    }

    return {
      Chunk,
      headAndTitleChunks,
      route,
      childContext: {
        ...props.context,
        busyRoute: props.context.busyRoute,
        unconsumedSteadyRouteChunks: unconsumedChunks.slice(index),
      },
    }
  }

  constructor(props: InnerViewProps) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: InnerViewProps, prevState: InnerViewState) {
    this.handleUpdate(prevState)
  }

  componentDidMount() {
    this.handleUpdate()
  }

  handleUpdate(prevState?: InnerViewState) {
    if (this.state.route && (!prevState || !prevState.route || prevState.route !== this.state.route)) {
      let prevRoute = prevState && prevState.route
      let nextRoute = this.state.route

      if (nextRoute && nextRoute.type !== 'busy') {
        if (prevRoute && 
          nextRoute.url.pathname === prevRoute.url.pathname &&
          nextRoute.url.search === prevRoute.url.search &&
          nextRoute.url.hash === prevRoute.url.hash) {
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
                  : 'auto'
          )
        }
      }
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error
    }

    let { Chunk, headAndTitleChunks } = this.state
    if (!Chunk || !Chunk.view) {
      let Suspense: React.ComponentType<any> = (React as any).Suspense
      if (Suspense) {
        throw this.props.context.navigation.getRoute()
      }
      else {
        console.warn(`A Navi <View> component was rendered before your Navigation store's state had become steady. Consider waiting before rendering with "await navigation.getRoute()", or upgrading React to version 16.6 to handle this with Suspense.`)
        return null
      }
    }

    let helmet =
      headAndTitleChunks &&
      headAndTitleChunks.length &&
      React.createElement(
        Helmet,
        null,
        ...headAndTitleChunks.map(Chunk =>
          Chunk.type === 'title' ? (
            createTitleElement(Chunk.title)
          ) : ( 
            (Chunk.head.type === React.Fragment || Chunk.head.type === 'head')
              ? Chunk.head.props.children 
              : Chunk.head
          )
        )
      )
    let content: React.ReactNode
    
    let render: undefined | ((view: any, route: Route) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (view: any, route: Route) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`A Navi <View> expects any children to be a function, but instead received "${render}".`)
      }
      content = this.props.children(Chunk.view, this.state.route!)
    }
    else if (Chunk.view) {
      if (typeof Chunk.view === 'function') {
        content = React.createElement(Chunk.view, { route: this.props.context.steadyRoute })
      }
      else if (typeof Chunk.view === 'string' || React.isValidElement(Chunk.view)) {
        content = Chunk.view
      }
    }
    else {
      throw new Error("A Navi <View> was not able to find a `children` prop, and was unable to find any body or head content in the consumed Route Chunk's `content`.")
    }

    return (
      <NaviContext.Provider value={this.state.childContext!}>
        {helmet || null}
        {
          // Clone the content to force a re-render even if content hasn't
          // changed, as Provider is a PureComponent.
          React.isValidElement(content)
            ? React.cloneElement(content)
            : content
        }
      </NaviContext.Provider>
    )
  }
}


export class MissingChunk extends NaviError {
  context: NaviContext

  constructor(context: NaviContext) {
    super(`A Navi <View> component attempted to use a Chunk that couldn't be found. This is likely due to its "where" prop.`)
    this.context = context
  }
}
