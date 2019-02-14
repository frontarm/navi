import React from 'react'
import { Navigation } from 'navi'
import { NaviContext } from './NaviContext'

interface NaviConsumerProps {
  children: (navigation: Navigation) => React.ReactNode
}

export function useNavigation() {
  return React.useContext(NaviContext).navigation
}

export function NaviConsumer({ children }: NaviConsumerProps) {
  return (
    <NaviContext.Consumer children={({ navigation }) =>
      children(navigation)
    } />
  )
}