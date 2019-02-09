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
  error?: NotFoundError,
  errorPathname?: string
  errorInfo?: any,
}

class InnerNotFoundBoundary extends React.Component<InnerNotFoundBoundaryProps, InnerNotFoundBoundaryState> {
  static getDerivedStateFromProps(props: InnerNotFoundBoundaryProps, state: InnerNotFoundBoundaryState): Partial<InnerNotFoundBoundaryState> | null {
    if (state.error && props.context.steadyRoute!.url.pathname !== state.errorPathname) {
      return {
        error: undefined,
        errorPathname: undefined,
        errorInfo: undefined,
      }
    }
    return null
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidCatch(error, errorInfo) {
    if (error instanceof NotFoundError) {
      this.setState({
        error,
        errorInfo,
        errorPathname: this.props.context.steadyRoute!.url.pathname,
      })
    }
    else {
      throw error
    }
  }

  componentDidUpdate(prevProps: InnerNotFoundBoundaryProps, prevState: InnerNotFoundBoundaryState) {
    if (this.state.error && !prevState.error) {
      // TODO: scroll to top / render title if necessary
    }
  }

  render() {
    if (this.state.error) {
      return this.props.render(this.state.error)
    }
    return this.props.children
  }
}
