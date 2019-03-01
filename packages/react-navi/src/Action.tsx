import * as React from 'react'
import { join as pathJoin } from 'path'
import { URLDescriptor, Navigation, createURLDescriptor } from 'navi'
import { NaviContext } from './NaviContext'

function useAction(method: string, href?: string | Partial<URLDescriptor>): [boolean, (body?: any) => void] {
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
  let url = createURLDescriptor(href)
  let busyURL = busyRoute && busyRoute.url
  let callback = React.useCallback((body?: any) => {
    this.props.context.navigation.navigate({
      url,
      method,
      body,
    })
  }, [method, href])
  let isBusy = !!(
    busyURL && 
    busyURL.pathname === url.pathname &&
    busyURL.search === url.search &&
    method === busyRoute!.method
  )
  
  return [isBusy, callback]
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

  let [isBusy, act] = useAction(method, href)
  let handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (props.disabled) {
      event.preventDefault()
      return
    }

    if (onClick) {
      onClick(event)
    }

    if (!event.defaultPrevented) {
      act(body)
    }
  }
  handleClick = React.useCallback(handleClick, [onClick, body, act])

  if (isBusy && busyClassName) {
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
