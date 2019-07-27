import * as React from 'react'
import {
  URLDescriptor,
  createURLDescriptor,
  joinPaths,
  modifyTrailingSlash,
} from 'navi'
import { NaviContext } from './NaviContext'
import {
  HashScrollContext,
  HashScrollBehavior,
  scrollToHash,
} from './HashScroll'

export interface UseLinkPropsOptions {
  children?: any
  className?: string
  disabled?: boolean
  hashScrollBehavior?: HashScrollBehavior
  hidden?: boolean
  href: string | Partial<URLDescriptor>
  id?: string
  lang?: string
  prefetch?: boolean
  rel?: string
  style?: object
  tabIndex?: number
  target?: string
  title?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
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
  target,
  onClick,
  ...rest
}: UseLinkPropsOptions) => {
  let hashScrollBehaviorFromContext = React.useContext(HashScrollContext)
  let context = React.useContext(NaviContext)
  let navigation = context.navigation

  if (hashScrollBehavior === undefined) {
    hashScrollBehavior = hashScrollBehaviorFromContext
  }

  let route = context.steadyRoute || context.busyRoute
  let routeURL = route && route.url
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

  // Prefetch on mount if required, or if `prefetch` becomes `true`.
  React.useEffect(() => {
    if (prefetch && navigation && linkURL && linkURL.pathname) {
      navigation.prefetch(linkURL).catch(e => {
        console.warn(
          `A <Link> tried to prefetch "${linkURL!.pathname}", but the ` +
            `router was unable to fetch this path.`,
        )
      })
    }
  }, [navigation, prefetch, linkURL && linkURL.href])

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

        // Let the browser handle targets natively
        if (target) {
          return
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
          navigation.navigate(linkURL)
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
    [
      disabled,
      onClick,
      target,
      linkURL && linkURL.href,
      routeURL && routeURL.href,
    ],
  )

  return {
    disabled,
    onClick: handleClick,
    href: linkURL ? linkURL.href : (href as string),
    ...rest,
  }
}

export interface LinkProps {
  active?: boolean
  activeClassName?: string
  activeStyle?: object
  children?: any
  className?: string
  disabled?: boolean
  exact?: boolean
  hashScrollBehavior?: HashScrollBehavior
  hidden?: boolean
  href: string | Partial<URLDescriptor>
  id?: string
  lang?: string
  prefetch?: boolean
  ref?: React.Ref<HTMLAnchorElement>
  rel?: string
  style?: object
  tabIndex?: number
  target?: string
  title?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>

  render?: (props: LinkRendererProps) => any
}

export interface LinkRendererProps {
  anchorProps: LinkContext
  active: boolean
  activeClassName?: string
  activeStyle?: object
  children: any
  className?: string
  disabled?: boolean
  tabIndex?: number
  hidden?: boolean
  href: string
  id?: string
  lang?: string
  style?: object
  target?: string
  title?: string
  onClick: React.MouseEventHandler<any>
}

export interface LinkAnchorProps extends LinkContext {}

export const LinkContext = React.createContext<LinkContext>(undefined as any)

export interface LinkContext {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  ref: React.Ref<HTMLAnchorElement>
  id?: string
  lang?: string
  rel?: string
  tabIndex?: number
  target?: string
  title?: string
  href?: string
}

export class LinkAnchor extends React.Component<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    fromDefaultRenderer?: boolean
  }
> {
  constructor(props) {
    super(props)

    if (process.env.NODE_ENV !== 'production') {
      if (!props.fromDefaultRenderer) {
        console.warn(
          `Deprecation Warning: "<LinkAnchor>" is deprecated. From Navi 0.14, ` +
            `you'll need to use the "useLinkProps()" and "useActive()" hooks instead.`,
        )
      }
    }
  }

  render() {
    return <LinkContext.Consumer children={this.renderChildren} />
  }

  renderChildren = (context: LinkContext) => {
    let { fromDefaultRenderer, ...props } = this.props
    let handleClick: React.MouseEventHandler<HTMLAnchorElement> =
      context.onClick
    if (this.props.onClick) {
      handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        this.props.onClick!(e)
        if (!e.defaultPrevented) {
          context.onClick(e)
        }
      }
    }

    return <a {...context} {...props} onClick={handleClick} />
  }
}

export namespace Link {
  export type Props = LinkProps
  export type RendererProps = LinkRendererProps
  export type AnchorProps = LinkAnchorProps
}

// Need to include this type definition, as the automatically generated one
// is incompatible with some versions of the react typings.
export const Link:
  | (React.ComponentClass<
      LinkProps & React.ClassAttributes<HTMLAnchorElement>
    > & {
      Anchor: typeof LinkAnchor
    })
  | (React.StatelessComponent<
      LinkProps & React.ClassAttributes<HTMLAnchorElement>
    > & {
      Anchor: typeof LinkAnchor
    }) = Object.assign(
  React.forwardRef(
    (props: LinkProps, anchorRef: React.Ref<HTMLAnchorElement>) => {
      let {
        active,
        activeClassName,
        activeStyle,
        children,
        exact,
        hashScrollBehavior,
        href,
        onClick,
        prefetch,
        render,
        ...rest
      } = props

      let linkProps = useLinkProps({
        hashScrollBehavior,
        href,
        onClick,
        prefetch,
      })

      let actualActive = useActive(href, { exact: !!exact })
      if (active === undefined) {
        active = actualActive
      }

      let context = {
        children,
        ...rest,
        ...linkProps,
        ref: anchorRef,
      }

      React.useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
          if (render !== defaultLinkRenderer) {
            console.warn(
              `Deprecation Warning: Passing a "render" prop to "<Link>" is deprecated. From Navi 0.14, ` +
                `you'll need to use the "useLinkProps()" and "useActive()" hooks instead.`,
            )
          }
        }
      }, [render])

      return (
        <LinkContext.Provider value={context}>
          {render!({
            active,
            activeClassName: props.activeClassName,
            activeStyle: props.activeStyle,
            anchorProps: context,
            children: props.children,
            className: props.className,
            disabled: props.disabled,
            tabIndex: props.tabIndex,
            hidden: props.hidden,
            href: linkProps.href,
            id: props.id,
            lang: props.lang,
            style: props.style,
            target: props.target,
            title: props.title,
            onClick: linkProps.onClick,
          })}
        </LinkContext.Provider>
      )
    },
  ),
  { Anchor: LinkAnchor },
)

function defaultLinkRenderer(props: LinkRendererProps) {
  let {
    active,
    activeClassName,
    activeStyle,
    children,
    className,
    hidden,
    style,
  } = props

  return (
    <LinkAnchor
      children={children}
      className={`${className || ''} ${(active && activeClassName) || ''}`}
      hidden={hidden}
      style={Object.assign({}, style, active ? activeStyle : {})}
      fromDefaultRenderer
    />
  )
}

Link.defaultProps = {
  render: defaultLinkRenderer,
}
