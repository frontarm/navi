import { History } from 'history'
import * as React from 'react'
import { Route, NaviError, Status, Segment, Router, isSegmentSteady } from 'navi'
import { NaviContext } from './NaviContext'


export interface ConsumeSegmentProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children: (output: ConsumeSegmentOutput) => React.ReactNode

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

  /**
   * Allows for a delay until the `showBusyIndicator` injected property becomes true.
   * Defaults to 333ms.
   */
  waitingIndicatorDelay?: number
}

export interface ConsumeSegmentOutput {
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
  
  /**
   * If delayed, and `delayBusyIndicator` milliseconds have passed then it will be true
   * Useful for rendering a loading bar, spinner, etc.
   */
  showWaitingIndicator: boolean,
  
  /**
   * If the user has navigated but we haven't resolved all the dependencies yet, then
   * this will be true.
   */
  isWaiting: boolean
}

export const ConsumeSegment: React.SFC<ConsumeSegmentProps> = function Consume(props: ConsumeSegmentProps) {
  return (
    <NaviContext.Consumer>
      {context => <InnerConsumeSegment {...props} context={context} />}
    </NaviContext.Consumer>
  )
}
ConsumeSegment.defaultProps = {
  isReady: (segment: Segment) => isSegmentSteady(segment),
  waitingIndicatorDelay: 333,
}


interface InnerConsumeSegmentProps extends ConsumeSegmentProps {
  context: NaviContext
}

interface InnerConsumeSegmentState {
  lastReady?: {
    context: NaviContext,
    childContext: NaviContext,
    segment: Segment,
    consumedSegments: Segment[],
  },
  delayedSince?: number,
  indicatingBusySince?: number,
  error?: Error
}

class InnerConsumeSegment extends React.Component<InnerConsumeSegmentProps, InnerConsumeSegmentState> {
  static getDerivedStateFromProps(props: InnerConsumeSegmentProps, state: InnerConsumeSegmentState): Partial<InnerConsumeSegmentState> {
    let unconsumedSegments = props.context.unconsumedSegments || props.context.route.segments

    let isReady = props.isReady!(unconsumedSegments[0])
    let lastReady = state.lastReady

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
      delayedSince: !isReady ? (state.delayedSince || new Date().getTime()) : undefined,
      indicatingBusySince: !isReady ? state.indicatingBusySince : undefined,
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

    if (this.state.lastReady && (!prevState || !prevState.lastReady || prevState.lastReady.context !== this.state.lastReady.context)) {
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

    let { history, router, route } = this.props.context

    let output: ConsumeSegmentOutput = 
      this.state.lastReady ? ({
        segment: this.state.lastReady.segment, 
        consumedSegments: this.state.lastReady.consumedSegments,
        unconsumedSegments: this.state.lastReady.childContext.unconsumedSegments!,
        showWaitingIndicator: !!this.state.indicatingBusySince,
        isWaiting: !!this.state.delayedSince,
        route: this.state.lastReady.childContext.route,
        history,
        router,
      }) : ({
        segment: undefined,
        consumedSegments: [],
        unconsumedSegments: [],
        showWaitingIndicator: !!this.state.indicatingBusySince,
        isWaiting: true,
        route,
        history,
        router,
      })
    
    let render: (props: ConsumeSegmentOutput) => React.ReactNode = this.props.children
    if (!render) {
      throw new Error("<Navi.ConsumeSegment> requires that you specify a `children` function.")
    }
    else if (typeof render !== "function") {
      throw new Error(`<Navi.ConsumeSegment> expects its children or "segment.content" to be a function, but instead received "${render}".`)
    }

    return (
      <NaviContext.Provider value={this.state.lastReady ? this.state.lastReady.childContext : this.props.context}>
        {render(output)}
      </NaviContext.Provider>
    )
  }
}


export class MissingSegment extends NaviError {
  context: NaviContext

  constructor(context: NaviContext) {
    super(`A <ConsumeSegment> component attempted to use a segment that couldn't be found.`)
    this.context = context
  }
}