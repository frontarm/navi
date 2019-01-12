import { isValidContext } from './Context'
import { isValidPage } from './Page'
import { isValidRedirect } from './Redirect'
import { isValidSwitch } from './Switch'
import { NaviNode } from './Node'

export function isValidDeclaration(x: any): x is NaviNode {
  return (
    isValidContext(x) ||
    isValidPage(x) ||
    isValidRedirect(x) ||
    isValidSwitch(x)
  )
}