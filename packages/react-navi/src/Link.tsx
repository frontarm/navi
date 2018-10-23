import * as React from 'react'
import { NaviContext } from './NaviContext'
import { URLDescriptor, Navigation, createURLDescriptor } from 'navi'


export interface LinkProps {
  active?: boolean,
  activeClassName?: string,
  activeStyle?: object,
  children: any,
  className?: string,
  disabled?: boolean,
  exact?: boolean,
  hidden?: boolean,
  href: string | Partial<URLDescriptor>,
  id?: string,
  lang?: string,
  rel?: string,
  style?: object,
  tabIndex?: number,
  target?: string,
  title?: string,
  precache?: boolean,
  onClick?: React.MouseEventHandler<HTMLAnchorElement>,

  render?: (props: LinkRendererProps) => any,
}

export interface LinkRendererProps {
  Anchor: React.SFC<React.AnchorHTMLAttributes<HTMLAnchorElement>>,

  active: boolean,
  activeClassName?: string,
  activeStyle?: object,
  children: any,
  className?: string,
  disabled?: boolean,
  tabIndex?: number,
  hidden?: boolean,
  href: string,
  id?: string,
  lang?: string,
  style?: object,
  target?: string,
  title?: string,
  onClick: React.MouseEventHandler<any>,
} 


export const Link: React.SFC<LinkProps> = function Link(props: LinkProps) {
  return (
    <NaviContext.Consumer>
      {context => <InnerLink context={context} {...props} />}
    </NaviContext.Consumer>
  )
}

Link.defaultProps = {
  render: (props: LinkRendererProps) => {
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
      <props.Anchor
        children={children}
        className={`${className || ''} ${(active && activeClassName) || ''}`}
        hidden={hidden}
        style={Object.assign({}, style, active ? activeStyle : {})}
      />
    )
  }
}


interface InnerLinkProps extends LinkProps {
  context: NaviContext
}

class InnerLink extends React.Component<InnerLinkProps> {
  navigation: Navigation

  constructor(props: InnerLinkProps) {
    super(props)

    let url = this.getURL()
    if (url && url.pathname) {
      this.props.context.router.resolve(url, {
        withContent: !!props.precache,
        followRedirects: true,
      })
        .catch(() => {
          console.warn(
            `A <Link> referred to href "${url!.pathname}", but the` +
            `router could not find this path.`
          )
        })
    }
  }

  getURL(): URLDescriptor | undefined  {
    let href = this.props.href

    // If this is an external link, return undefined so that the native
    // response will be used.
    if (!href || typeof href === 'string' && (href.indexOf('://') !== -1 || href.indexOf('mailto:') === 0)) {
      return
    }

    return createURLDescriptor(href)
  }
  
  render() {
    let props = this.props
    let linkURL = this.getURL()
    let navigationURL = this.props.context.url
    let active = !!(
      linkURL &&
      (props.exact
        ? linkURL.pathname === navigationURL.pathname
        : navigationURL.pathname.indexOf(linkURL.pathname) === 0)
    )

    return props.render!({
      Anchor: this.Anchor,
      active,
      activeClassName: props.activeClassName,
      activeStyle: props.activeStyle,
      children: props.children,
      className: props.className,
      disabled: props.disabled,
      tabIndex: props.tabIndex,
      hidden: props.hidden,
      href: linkURL ? linkURL.href : props.href as string,
      id: props.id,
      lang: props.lang,
      style: props.style,
      target: props.target,
      title: props.title,
      onClick: this.handleClick,
    })
  }

  Anchor = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    let linkURL = this.getURL()
    let handleClick: React.MouseEventHandler<HTMLAnchorElement> = this.handleClick
    if (props.onClick) {
      handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        props.onClick!(e)
        if (!e.defaultPrevented) {
          this.handleClick(e)
        }
      }
    }

    return (
      <a
        id={this.props.id}
        lang={this.props.lang}
        rel={this.props.target}
        tabIndex={this.props.tabIndex}
        target={this.props.target}
        title={this.props.title}

        {...props}

        href={linkURL ? linkURL.href : this.props.href as string}
        onClick={handleClick}
      />
    )
  }

  handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle the event directly if:
    // - The user used the middle/right mouse button
    // - The user was holding a modifier key
    // - A `target` property is set (which may cause the browser to open the
    //   link in another tab)
    if (event.button === 0 &&
        !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) &&
        !this.props.target) {

      if (this.props.disabled) {
        event.preventDefault()
        return
      }

      if (this.props.onClick) {
        this.props.onClick(event)
      }
      
      let url = this.getURL()
      if (!event.defaultPrevented && url) {
        event.preventDefault()
        this.props.context.history.push(url)
      }
    }
  }
}
