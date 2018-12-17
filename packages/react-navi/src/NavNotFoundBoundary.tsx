import * as React from 'react'
import { NotFoundError } from 'navi'
import { NavContext } from './NavContext'
import { NavLoadingContext } from './NavLoading'

export interface NavNotFoundBoundaryProps {
  render: (error: NotFoundError) => React.ReactNode,
}

export namespace NavNotFoundBoundary {
  export type Props = NavNotFoundBoundaryProps
}

export const NavNotFoundBoundary: React.SFC<NavNotFoundBoundaryProps> = function ErrorBoundary(props: NavNotFoundBoundaryProps) {
  return (
    <NavContext.Consumer>
      {context =>
        <NavLoadingContext.Consumer>
          {loadingContext =>
            <InnerNotFoundBoundary
              context={context}
              loadingContext={loadingContext}
              {...props}
            />
          }
        </NavLoadingContext.Consumer>
      }
    </NavContext.Consumer>
  )
}


interface InnerNotFoundBoundaryProps extends NavNotFoundBoundaryProps {
  context: NavContext
  loadingContext: NavLoadingContext
}

interface InnerNotFoundBoundaryState {
  awaitingSteady?: boolean
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
      
      if (this.props.loadingContext.isLoading) {
        this.props.loadingContext.setLoading(false)
      }
    }
    else {
      throw error
    }
  }

  componentDidUpdate(prevProps: InnerNotFoundBoundaryProps, prevState) {
    if (this.props.context.url.pathname !== prevProps.context.url.pathname && this.state.current) {
      if (this.props.context.route.isSteady) {
        this.setState({
          current: undefined
        })
      }
      else {
        this.setState({
          awaitingSteady: true
        })
        this.props.loadingContext.setLoading(true)
      }
    }
    else if (this.state.awaitingSteady && this.props.context.route.isSteady) {
      this.setState({
        awaitingSteady: false,
        current: undefined,
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
