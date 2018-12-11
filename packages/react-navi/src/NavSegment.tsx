import { History } from 'history'
import * as React from 'react'
import { Route, NaviError, Status, Segment, Router, isSegmentSteady } from 'navi'
import { NavContext } from './NavContext'
import { NavLoadingContext, NavLoading } from './NavLoading'


export interface NavSegmentProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children: (output: NavSegmentOutput) => React.ReactNode

  /**
   * The first segment that matches this will be consumed, along with
   * all segments before it.
   */
  where?: (segment: Segment, index: number, unconsumedSegments: Segment[]) => boolean

  /**
   * A function that indicates whether the first unconsumed segment is ready
   * to be traversed. Defaults to checking with `isSegmentSteady()`.
   */
  isReady?: (firstUnconsumedSegment: Segment) => boolean
}

export interface NavSegmentOutput {
  /**
   * The segment that was matched by the `where` clause (or the previous one if delayed).
   * If the component has just been mounted and it has not yet encountered a ready
   * segment, then this will be undefined.
   */
  segment?: Segment,

  /**
   * An array of all segments from Navi.Context's `unconsumedSegments` up to
   * and including the matched segment.
   */
  consumedSegments: Segment[],

  /**
   * An array of all segments from Navi.Context that remain after the consumed
   * segment.
   */
  unconsumedSegments: Segment[],

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

export namespace NavSegment {
  export type Props = NavSegmentProps
  export type Output = NavSegmentOutput
}

export const NavSegment: React.SFC<NavSegmentProps> = function Consume(props: NavSegmentProps) {
  return (
    <NavContext.Consumer>
      {context =>
        <NavLoadingContext.Consumer>
          {navLoadingContext =>
            <InnerConsumeSegment {...props} context={context} navLoadingContext={navLoadingContext} />
          }
        </NavLoadingContext.Consumer>
      }
    </NavContext.Consumer>
  )
}
NavSegment.defaultProps = {
  isReady: (segment: Segment) => isSegmentSteady(segment),
}


interface InnerConsumeSegmentProps extends NavSegmentProps {
  context: NavContext
  navLoadingContext: NavLoadingContext
}

interface InnerConsumeSegmentState {
  lastReady?: {
    context: NavContext,
    childContext: NavContext,
    segment: Segment,
    consumedSegments: Segment[],
  },
  isReady?: boolean,
  error?: Error
}

class InnerConsumeSegment extends React.Component<InnerConsumeSegmentProps, InnerConsumeSegmentState> {
  static getDerivedStateFromProps(props: InnerConsumeSegmentProps, state: InnerConsumeSegmentState): Partial<InnerConsumeSegmentState> | null {
    let unconsumedSegments = props.context.unconsumedSegments || props.context.route.segments
    let lastReady = state.lastReady

    // Bail if nothing has changed
    if (lastReady && lastReady.context === props.context) {
      return null
    }

    let isReady = props.isReady!(unconsumedSegments[0])

    if (isReady) {
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

      lastReady = {
        segment,
        consumedSegments,
        context: props.context,
        childContext: {
          ...props.context,
          unconsumedSegments: unconsumedSegments.slice(index + 1),
        },
      }
    }

    return {
      lastReady,
      isReady,
    }
  }

  showBusyIndicatorTimeout?: number

  constructor(props: InnerConsumeSegmentProps) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: InnerConsumeSegmentProps, prevState: InnerConsumeSegmentState) {
    this.handleUpdate(prevState)
  }

  componentDidMount() {
    this.handleUpdate()
  }

  handleUpdate(prevState?: InnerConsumeSegmentState) {
    if (this.state.lastReady && (!prevState || !prevState.lastReady || prevState.lastReady.context !== this.state.lastReady.context)) {
      this.state.lastReady.context.onRendered()
    }

    if (!this.state.isReady && !this.props.navLoadingContext.isLoading) {
      this.props.navLoadingContext.setLoading(true)
    }
    else if (this.state.isReady && this.props.navLoadingContext.isLoading) {
      this.props.navLoadingContext.setLoading(false)
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

    let { history, router, route } = this.props.context

    let output: NavSegmentOutput = 
      this.state.lastReady ? ({
        segment: this.state.lastReady.segment, 
        consumedSegments: this.state.lastReady.consumedSegments,
        unconsumedSegments: this.state.lastReady.childContext.unconsumedSegments!,
        route: this.state.lastReady.childContext.route,
        history,
        router,
      }) : ({
        segment: undefined,
        consumedSegments: [],
        unconsumedSegments: [],
        route,
        history,
        router,
      })
    
    let render: (props: NavSegmentOutput) => React.ReactNode = this.props.children
    if (!render) {
      throw new Error("<NavSegment> requires that you specify a `children` function.")
    }
    else if (typeof render !== "function") {
      throw new Error(`<NavSegment> expects its children or "segment.content" to be a function, but instead received "${render}".`)
    }

    return (
      /*
        As this segment handles any Loading element up the tree, we need
        to hide it from any child segments. 
      */
      <NavLoadingContext.Provider value={{ isLoading: false, setLoading: noop }}>
        <NavContext.Provider value={this.state.lastReady ? this.state.lastReady.childContext : this.props.context}>
          {render(output)}
        </NavContext.Provider>
      </NavLoadingContext.Provider>
    )
  }
}


function noop() {}


export class MissingSegment extends NaviError {
  context: NavContext

  constructor(context: NavContext) {
    super(`A <NavSegment> component attempted to use a segment that couldn't be found.`)
    this.context = context
  }
}