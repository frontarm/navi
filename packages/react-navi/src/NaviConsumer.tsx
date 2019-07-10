import * as React from 'react'
import { Navigation } from 'navi'
import { NaviContext } from './NaviContext'

interface NaviConsumerProps {
  children: (navigation: Navigation) => React.ReactNode
}

export function useNavigation() {
  return React.useContext(NaviContext).navigation
}

export function NaviConsumer({ children }: NaviConsumerProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Deprecation Warning: "<NaviConsumer>" is deprecated. From Navi 0.14, ` +
          `you'll need to use the "useNavigation()" hook instead.`
      )
    }
  }, [])

  return (
    <NaviContext.Consumer children={({ navigation }) =>
      children(navigation)
    } />
  )
}