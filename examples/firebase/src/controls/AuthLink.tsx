import { createURLDescriptor } from 'navi'
import React from 'react'
import { Link, useCurrentRoute } from 'react-navi'
import { Omit } from '../types/Omit'

export interface AuthLinkProps extends Omit<Link.Props, 'href'> {
  href?: string
}

export type AuthLinkRendererProps = Link.RendererProps

/**
 * A link that passes through any auth-related URL parameters.
 * 
 * Defaults to pointing to the "login" screen unless the user is currently
 * viewing the "login" screen, in which case it points to the "register"
 * screen.
 */
function AuthLink(props: AuthLinkProps) {
  let currentRoute = useCurrentRoute()
  let url = createURLDescriptor(props.href || '/login')

  Object.assign(url.query, currentRoute.url.query)

  return (
    <Link {...props} href={url} />
  )
}

export default AuthLink