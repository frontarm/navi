import * as React from 'react'

export const NavLoadingContext = React.createContext<NavLoadingContext>({
  isLoading: false,
  setLoading: (isLoading: boolean) => {},
})

export interface NavLoadingContext {
  isLoading: boolean,
  setLoading: (isLoading: boolean) => void,
}

export interface NavLoadingProps {
  children: (isLoading: boolean) => React.ReactNode,
}

export interface NavLoadingState {
  isLoading: boolean,
  setLoading: (isLoading: boolean) => void,
}

export namespace NavLoading {
  export type Props = NavLoadingProps
}

// This is a PureComponent so that setting state to loading
// when it is already loading won't cause a re-render
export class NavLoading extends React.PureComponent<NavLoadingProps, NavLoadingState> {
  constructor(props: NavLoadingProps) {
    super(props)

    this.state = {
      isLoading: false,
      setLoading: this.setLoading,
    }
  }

  render() {
    return (
      <NavLoadingContext.Provider value={this.state}>
        {this.props.children(this.state.isLoading)}
      </NavLoadingContext.Provider>
    )
  }

  setLoading = (isLoading: boolean) => {
    this.setState({
      isLoading,
    })
  }
}