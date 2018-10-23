import * as React from 'react'
import { Segment, isSegmentSteady, Status, SegmentType } from 'navi'
import { ConsumeSegment, ConsumeSegmentOutput } from './ConsumeSegment'


export interface ConsumeContentSegmentProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children?: (output: ConsumeSegmentOutput) => React.ReactNode

  /**
   * A function that indicates whether the first unconsumed segment is ready
   * to be traversed. Defaults to checking with `isSegmentSteady()`.
   */
  isReady?: (segment: Segment) => boolean

  /**
   * Allows for a delay until the `showBusyIndicator` injected property becomes true.
   * Defaults to 333ms.
   */
  waitingIndicatorDelay?: number
}

function hasContentOrIsLast(segment: Segment) {
  return segment.content || segment.status === Status.Busy || segment.type !== SegmentType.Switch
}

export class ConsumeContentSegment extends React.Component<ConsumeContentSegmentProps> {
  static defaultProps = {
    isReady: (Segment: Segment) => isSegmentSteady(Segment),
    waitingIndicatorDelay: 333,
  }

  render() {
    return (
      <ConsumeSegment
        where={hasContentOrIsLast}
        isReady={this.props.isReady}
        waitingIndicatorDelay={this.props.waitingIndicatorDelay}
        children={this.renderChildren}
      />
    )
  }

  renderChildren = (output: ConsumeSegmentOutput): React.ReactNode => {
    let render: undefined | ((props: ConsumeSegmentOutput) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (props: ConsumeSegmentOutput) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<Navi.ConsumeContentSegment> expects its children to be a function, but instead received "${render}".`)
      }
    }
    else if (output.segment && output.segment.content) {
      let content = output.segment.content
      if (typeof content === 'function') {
        render = output.segment.content
      }
      else if (React.isValidElement(content)) {
        return content
      }
    }
    if (!render) {
      throw new Error("<Navi.ConsumeContentSegment> was not able to find a `children` prop, or a `render` function in the consumed segment's `content`.")
    }

    return render(output)
  }
}
