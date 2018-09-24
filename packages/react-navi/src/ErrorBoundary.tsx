import * as React from 'react'
import { NaviError, NotFoundError, UnresolvableError } from 'junctions'
import { NavigationContext } from './NavigationContext'

export interface ErrorBoundaryProps {
  renderUnresolvable?: (error: UnresolvableError) => React.ReactNode,
  renderNotFound?: (error: NotFoundError) => React.ReactNode,
  onError?: (error: NaviError, info: any) => void,
}

export const ErrorBoundary: React.SFC<ErrorBoundaryProps> = function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <NavigationContext.Consumer>
      {context => <NaviErrorBoundary context={context} {...props} />}
    </NavigationContext.Consumer>
  )
}


interface NaviErrorBoundaryProps extends ErrorBoundaryProps {
  context: NavigationContext
}

interface NaviErrorBoundaryState {
  current?: {
    error: NaviError,
    info: any,
  }
}

class NaviErrorBoundary extends React.Component<NaviErrorBoundaryProps, NaviErrorBoundaryState> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidCatch(error, info) {
    if ((this.props.renderNotFound && error instanceof NotFoundError) || (this.props.renderUnresolvable && error instanceof UnresolvableError)) {
      this.setState({ current: { error, info } })
      if (this.props.onError) {
        this.props.onError(error, info)
      }
    }
    else {
      throw error
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.context !== prevProps.context && this.state.current) {
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
      let error = this.state.current.error
      let content: React.ReactNode
      if (error instanceof NotFoundError) {
        content = this.props.renderNotFound!(error)
      }
      else if (error instanceof UnresolvableError) {
        content = this.props.renderUnresolvable!(error)
      }
      if (!content) {
        throw this.state.current.error
      }
      return content
    }
    return this.props.children
  }
}
