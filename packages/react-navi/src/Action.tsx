import * as React from 'react'
import { join as pathJoin } from 'path'
import { URLDescriptor, createURLDescriptor, Route } from 'navi'
import { NaviContext } from './NaviContext'

function useURL(href?: string | Partial<URLDescriptor>) {
  let context = React.useContext(NaviContext)
  let busyRoute = context.busyRoute
  let route = (context.steadyRoute || busyRoute)!
  let navigationURL = route && route.url
  if (!href) {
    href = navigationURL
  }
  // The route `pathname` should always end with a `/`, so this
  // will give us a consistent behavior for `.` and `..` links.
  if (navigationURL && typeof href === 'string' && href[0] === '.') {
    href = pathJoin(navigationURL.pathname, href)
  }
  return createURLDescriptor(href)
}

export function useAction(method: string, href?: string | Partial<URLDescriptor>): (body?: any) => Promise<Route> {
  let context = React.useContext(NaviContext)
  let url = useURL(href)
  let callback = React.useCallback((body?: any) => (
    context.navigation.navigate({
      url,
      method,
      body,
    })
  ), [method, href])
  
  return callback
}


export interface ActionProps {
  body?: any,
  busyClassName?: string,
  busyStyle?: object,
  component?: React.ComponentType,
  children?: any,
  className?: string,
  disabled?: boolean,
  hidden?: boolean,
  href?: string | Partial<URLDescriptor>,
  id?: string,
  lang?: string,
  method: string,
  ref?: React.Ref<HTMLElement>,
  style?: object,
  tabIndex?: number,
  title?: string,
  type?: string
  onClick?: React.MouseEventHandler<HTMLElement>,
  onComplete?: (route: Route) => void,
}

function useRefCounter(): [boolean, () => void, () => void] {
  let counterRef = React.useRef(0)
  let [isZero, setIsZero] = React.useState(true)

  let increase = React.useCallback(() => {
    if (counterRef.current++ === 0) {
      setIsZero(false)
    }
  }, [])
  let decrease = React.useCallback(() => {
    if (--counterRef.current === 0) {
      setIsZero(true)
    }
  }, [])
  
  return [isZero, increase, decrease]
}

export function Action(props: ActionProps) {
  let {
    body,
    busyClassName,
    busyStyle,
    className,
    component = 'button',
    href,
    method,
    onClick,
    style,
    ...passthrough
  } = props

  let [busy, increaseBusy, decreaseBusy] = useRefCounter()
  let act = useAction(method, href)
  let handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (props.disabled) {
      event.preventDefault()
      return
    }

    if (onClick) {
      onClick(event)
    }

    if (!event.defaultPrevented) {
      increaseBusy()
      act(body).then(
        route => {
          decreaseBusy()
          if (props.onComplete) {
            props.onComplete(route)
          }
        },
        decreaseBusy,
      )
    }
  }
  handleClick = React.useCallback(handleClick, [onClick, body, act])

  if (busy && busyClassName) {
    className = className ? (className+' '+busyClassName) : busyClassName
    style = style ? { ...style, ...busyStyle } : busyStyle
  }

  if (component === 'button' && !passthrough.type) {
    passthrough.type = 'button'
  }

  return React.createElement(component as any, {
    ...passthrough,
    className,
    style,
    onClick: handleClick,
  })
}
