import * as React from 'react'
import { Segment, isSegmentSteady, Status, SegmentType } from 'navi'
import { NavSegment, NavSegmentOutput } from './NavSegment'


export interface NavContentSegmentProps {
  /**
   * A render function that will be used to render the selected segment.
   */
  children?: (output: NavSegmentOutput) => React.ReactNode

  /**
   * A function that indicates whether the first unconsumed segment is ready
   * to be traversed. Defaults to checking with `isSegmentSteady()`.
   */
  isReady?: (segment: Segment) => boolean
}

function isContentOrFinalSegment(segment: Segment) {
  return segment.content || segment.status === Status.Busy || segment.type !== SegmentType.Switch
}

export namespace NavContentSegment {
  export type Props = NavContentSegmentProps
  export type Output = NavSegmentOutput
}

export class NavContentSegment extends React.Component<NavContentSegmentProps> {
  static defaultProps = {
    isReady: (Segment: Segment) => isSegmentSteady(Segment),
  }

  render() {
    return (
      <NavSegment
        where={isContentOrFinalSegment}
        isReady={this.props.isReady}
        children={this.renderChildren}
      />
    )
  }

  renderChildren = (output: NavSegmentOutput): React.ReactNode => {
    let render: undefined | ((props: NavSegmentOutput) => React.ReactNode)
    if (this.props.children) {
      render = this.props.children as (props: NavSegmentOutput) => React.ReactNode
      if (typeof render !== "function") {
        throw new Error(`<NavRoute> expects its children to be a function, but instead received "${render}".`)
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
      throw new Error("<NavRoute> was not able to find a `children` prop, or a `render` function in the consumed segment's `content`.")
    }

    return render(output)
  }
}
