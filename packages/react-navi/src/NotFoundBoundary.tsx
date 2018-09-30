import * as React from 'react'
import { NotFoundError } from 'junctions'
import { NaviContext } from './NaviContext'

export interface NotFoundBoundaryProps {
  render: (error: NotFoundError) => React.ReactNode,
}

export const NotFoundBoundary: React.SFC<NotFoundBoundaryProps> = function ErrorBoundary(props: NotFoundBoundaryProps) {
  return (
    <NaviContext.Consumer>
      {context => <InnerNotFoundBoundary context={context} {...props} />}
    </NaviContext.Consumer>
  )
}


interface InnerNotFoundBoundaryProps extends NotFoundBoundaryProps {
  context: NaviContext
}

interface InnerNotFoundBoundaryState {
  current?: {
    error: NotFoundError,
    info: any,
  }
}

class InnerNotFoundBoundary extends React.Component<InnerNotFoundBoundaryProps, InnerNotFoundBoundaryState> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidCatch(error, info) {
    if (error instanceof NotFoundError) {
      this.setState({ current: { error, info } })
    }
    else {
      throw error
    }
  }

  componentDidUpdate(prevProps: InnerNotFoundBoundaryProps, prevState) {
    if (this.props.context.url.pathname !== prevProps.context.url.pathname && this.state.current) {
      this.setState({
        current: undefined
      })
    }
    else if (this.state.current && !prevState.current) {
      this.props.context.onRendered()
    }
  }

  render() {
    if (this.state.current) {
      return this.props.render(this.state.current.error)
    }
    return this.props.children
  }
}
