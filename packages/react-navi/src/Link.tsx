import * as React from 'react'
import {
  URLDescriptor,
  createURLDescriptor,
  joinPaths,
  modifyTrailingSlash,
} from 'navi'
import {
  HashScrollContext,
  HashScrollBehavior,
  scrollToHash,
} from './HashScroll'
import { NaviContext } from './NaviContext'

export interface UseLinkPropsOptions {
  disabled?: boolean
  hashScrollBehavior?: HashScrollBehavior
  href: string | Partial<URLDescriptor>
  prefetch?: boolean | 'hover' | 'mount'
  state?: object
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>
}

function isExternalHref(href) {
  // If this is an external link, return undefined so that the native
  // response will be used.
  return (
    !href ||
    (typeof href === 'string' &&
      (href.indexOf('://') !== -1 || href.indexOf('mailto:') === 0))
  )
}

function getLinkURL(
  href: string | Partial<URLDescriptor>,
  routeURL?: URLDescriptor,
): undefined | URLDescriptor {
  if (!isExternalHref(href)) {
    // Resolve relative to the current "directory"
    if (routeURL && typeof href === 'string') {
      href = href[0] === '/' ? href : joinPaths('/', routeURL.pathname, href)
    }
    return createURLDescriptor(href)
  }
}

/**
 * Returns a boolean that indicates whether the user is currently
 * viewing the specified href.
 * @param href
 * @param options.exact If false, will match any URL underneath this href
 * @param options.loading If true, will match even if the route is currently loading
 */
export const useActive = (
  href: string | Partial<URLDescriptor>,
  {
    exact = true,
    loading = false,
  }: {
    /**
     * If false, will return true even if viewing a child of this route.
     */
    exact?: boolean

    /**
     * If true, this will return true even if the route is currently just
     * loading.
     */
    loading?: boolean
  } = {},
) => {
  let context = React.useContext(NaviContext)
  let route = loading
    ? context.busyRoute || context.steadyRoute
    : context.steadyRoute || context.busyRoute
  let routeURL = route && route.url
  let linkURL = getLinkURL(href, routeURL)

  return !!(
    linkURL &&
    routeURL &&
    (exact
      ? linkURL.pathname === routeURL.pathname
      : modifyTrailingSlash(routeURL.pathname, 'add').indexOf(
          linkURL.pathname,
        ) === 0)
  )
}

export const useLinkProps = ({
  disabled,
  hashScrollBehavior,
  href,
  prefetch,
  state,
  onClick,
  onMouseEnter,
}: UseLinkPropsOptions) => {
  if (prefetch && state) {
    prefetch = false

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: A <Link> component received both "prefetch" and "state" ` +
          `props, but links with state cannot be prefetched. Skipping prefetch.`,
      )
    }
  }

  if (prefetch === true) {
    prefetch = 'mount'

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: A <Link> component received a "prefetch" value of "true". ` +
          `This value is no longer supported - please set it to "mount" instead.`,
      )
    }
  }

  // Prefetch on hover by default.
  if (prefetch === undefined) {
    prefetch = 'hover'
  }

  const hashScrollBehaviorFromContext = React.useContext(HashScrollContext)
  const context = React.useContext(NaviContext)
  const navigation = context.navigation

  if (hashScrollBehavior === undefined) {
    hashScrollBehavior = hashScrollBehaviorFromContext
  }

  const route = context.steadyRoute || context.busyRoute
  const routeURL = React.useMemo(() => route && route.url, [route?.url.href])
  let linkURL = getLinkURL(href, routeURL)

  if (!isExternalHref(href)) {
    let resolvedHref = href
    // Resolve relative to the current "directory"
    if (routeURL && typeof href === 'string') {
      resolvedHref =
        href[0] === '/' ? href : joinPaths('/', routeURL.pathname, href)
    }
    linkURL = createURLDescriptor(resolvedHref)
  }

  // We need a URL descriptor that stays referentially equal so that we don't
  // trigger prefetches more than we'd like.
  const memoizedLinkURL = React.useMemo(() => linkURL, [linkURL?.href])

  let doPrefetch = React.useMemo(() => {
    let hasPrefetched = false

    return () => {
      if (
        !hasPrefetched &&
        memoizedLinkURL &&
        memoizedLinkURL.pathname &&
        navigation
      ) {
        hasPrefetched = true
        navigation.prefetch(memoizedLinkURL).catch(e => {
          console.warn(
            `A <Link> tried to prefetch "${
              memoizedLinkURL!.pathname
            }", but the ` + `router was unable to fetch this path.`,
          )
        })
      }
    }
  }, [memoizedLinkURL, navigation])

  // Prefetch on mount if required, or if `prefetch` becomes `true`.
  React.useEffect(() => {
    if (prefetch === 'mount') {
      doPrefetch()
    }
  }, [prefetch, doPrefetch])

  let handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch === 'hover') {
        if (onMouseEnter) {
          onMouseEnter(event)
        }

        if (disabled) {
          event.preventDefault()
          return
        }

        if (!event.defaultPrevented) {
          doPrefetch()
        }
      }
    },
    [disabled, doPrefetch, onMouseEnter, prefetch],
  )

  let handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Let the browser handle the event directly if:
      // - The user used the middle/right mouse button
      // - The user was holding a modifier key
      // - A `target` property is set (which may cause the browser to open the
      //   link in another tab)
      if (
        event.button === 0 &&
        !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      ) {
        if (disabled) {
          event.preventDefault()
          return
        }

        if (onClick) {
          onClick(event)
        }

        // Sanity check
        if (!routeURL) {
          return
        }

        if (!event.defaultPrevented && linkURL) {
          event.preventDefault()

          let isSamePathname =
            modifyTrailingSlash(linkURL.pathname, 'remove') ===
            modifyTrailingSlash(routeURL.pathname, 'remove')
          navigation.navigate(linkURL, state ? { state } : undefined)
          if (
            (isSamePathname || linkURL.pathname === '') &&
            linkURL.hash === routeURL.hash &&
            linkURL.hash
          ) {
            scrollToHash(routeURL.hash, hashScrollBehavior)
          }
        }
      }
    },
    [disabled, onClick, linkURL && linkURL.href, routeURL && routeURL.href],
  )

  return {
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    href: linkURL ? linkURL.href : (href as string),
  }
}

export interface LinkProps
  extends UseLinkPropsOptions,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  active?: boolean
  activeClassName?: string
  activeStyle?: object
  exact?: boolean
  ref?: React.Ref<HTMLAnchorElement>
}

export namespace Link {
  export type Props = LinkProps
}

// Need to include this type definition, as the automatically generated one
// is incompatible with some versions of the react typings.
export const Link: React.FunctionComponent<LinkProps> = React.forwardRef(
  (props: LinkProps, anchorRef: React.Ref<HTMLAnchorElement>) => {
    let {
      active,
      activeClassName = '',
      activeStyle = {},
      className = '',
      disabled,
      exact,
      hashScrollBehavior,
      href: hrefProp,
      onClick: onClickProp,
      onMouseEnter: onMouseEnterProp,
      prefetch,
      state,
      style = {},
      ...rest
    } = props

    let { onClick, onMouseEnter, ...linkProps } = useLinkProps({
      hashScrollBehavior,
      href: hrefProp,
      onClick: onClickProp,
      onMouseEnter: onMouseEnterProp,
      prefetch,
      state,
    })

    let actualActive = useActive(linkProps.href, { exact: !!exact })
    if (active === undefined) {
      active = actualActive
    }

    return (
      <a
        ref={anchorRef}
        className={`${className} ${(active ? activeClassName : '')}`}
        style={{
          ...style,
          ...(active ? activeStyle : {})
        }}
        {...rest}
        {...linkProps}
        // Don't handle events on links with a `target` prop.
        onClick={props.target ? onClickProp : onClick}
        onMouseEnter={props.target ? onMouseEnterProp : onMouseEnter}
      />
    )
  },
)
