import * as React from 'react'
import { Junction, Page, RouteSegment } from 'junctions'


export interface JunctionActiveChildProps {
  /**
   * The Junction object to render
   */
  junction: Junction,

  /**
   * Allows you to easily pass environment state down through your routes.
   */
  env: any,

  /**
   * When there is an active child, this function will be used to render its
   * component.
   * 
   * By default, the component will be rendered with a `junction` or `page`
   * prop that is passed the active child, and an `env` prop if one is
   * passed to the wrapper.
   */
  render?: (props: JunctionActiveChildRendererProps) => React.ReactElement<any>,

  /**
   * An optional element to render if the junction doesn't know how to
   * deal with the full URL that it was supplied.
   */
  notFoundElement?: React.ReactElement<any>,

  /**
   * An optional element to render if the junction is still loading the
   * code which will be used to handle routing for the current URL.
   */
  busyElement?: React.ReactElement<any>,

  /**
   * An optional element to render if the something prevented the router
   * from loading the code that is required to handle routing for the
   * current URL.
   */
  errorElement?: React.ReactElement<any>,
}


export interface JunctionActiveChildRendererProps {
  Component: React.ComponentType<any>,
  child: Junction | Page,
  env: any,
}


export const defaultJunctionActiveChildRenderer = ({ Component, child, env }: JunctionActiveChildRendererProps) =>
  React.createElement(Component, {
    [child.type]: child,
    env: env,
  })


export function JunctionActiveChild({
    junction,
    env,
    render = defaultJunctionActiveChildRenderer,
    notFoundElement = null,
    busyElement = null,
    errorElement = null
}: JunctionActiveChildProps) {
  let child = junction.activeChild as RouteSegment | undefined
  if (child && child.type !== "redirect") {
    return render({
      Component: child.component,
      child: child,
      env: env,
    })
  }
  else if (junction.status === "busy") {
    return busyElement
  }
  else if (junction.status === "notfound") {
    return notFoundElement
  }
  else {
    return errorElement
  }
}
