import React from 'react'
import { DocumentContext } from '../DocumentContext'

export interface DemoboardProps {
  /**
   * If present, any changes will be saved for each user, and loaded when the
   * user navigates back to the page. This key will not be visible to the user,
   * and should be unique across the entire site. It should follow the format
   * `path#keyWithinPage`. A warning will be logged if the path doesn't map to
   * the current path, or if multiple keys are used on the same page.
   */
  persistenceKey?: string

  /**
   * If true, readers won't be able to use the demoboard unless
   * `canAccessRestrictedContent` is also passed to the parent `<Document>`
   * element.
   */
  restricted?: boolean

  /**
   * For inline demoboards, this contains highlighted source that may be
   * useful while the demoboard is loading.
   */
  highlightedSource?: string

  /**
   * Accepts a list of sources, with magic sources prefixed by `magic:`, and
   * solution sources prefixed by `solution:`.
   *
   * Future plan: create a loader that allows an entire directory to be smashed
   * in here with a single `require()`...*
   */
  sources: {
    [key: string]: string
  }

  theme?: "dark" | "light"

  maximizeLeftPanel?: boolean
  maximizeRightPanel?: boolean
  leftPanel?: 'transformedSource' | 'solutionSource'
  lineCount?: number
  rightPanel?: 'console'
  tab?: 'editor' | 'viewer'

  className?: string
  id?: string
  style?: React.CSSProperties
}

export class Demoboard extends React.Component<DemoboardProps> {
  static contextType = DocumentContext

  render() {
    return <this.context.components.Demoboard {...this.props} />
  }
}