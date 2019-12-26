import * as React from 'react'
import { NaviContext } from './NaviContext'

export function useNavigation() {
  return React.useContext(NaviContext).navigation
}
