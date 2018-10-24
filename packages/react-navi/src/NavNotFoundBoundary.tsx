import * as React from 'react'
import { NotFoundError } from 'navi'
import { NavContext } from './NavContext'

export interface NavNotFoundBoundaryProps {
  render: (error: NotFoundError) => React.ReactNode,
}

export namespace NavNotFoundBoundary {
  export type Props = NavNotFoundBoundaryProps
}

export const NavNotFoundBoundary: React.SFC<NavNotFoundBoundaryProps> = function ErrorBoundary(props: NavNotFoundBoundaryProps) {
  return (
    <NavContext.Consumer>
      {context => <InnerNotFoundBoundary context={context} {...props} />}
    </NavContext.Consumer>
  )
}


interface InnerNotFoundBoundaryProps extends NavNotFoundBoundaryProps {
  context: NavContext
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
