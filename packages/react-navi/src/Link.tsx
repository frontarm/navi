import * as React from 'react'
import * as PropTypes from 'prop-types'
import { createHref, Location, Navigation } from 'junctions'


export interface LinkProps {
  // NOTE: must be used with react-cx
  cx?: any,

  active?: boolean,
  activeClassName?: string,
  activeStyle?: object,
  children: any,
  className?: string,
  disabled?: boolean,
  env: { navigation: Navigation },
  exact?: boolean,
  hidden?: boolean,
  href: string | Location,
  id?: string,
  lang?: string,
  style?: object,
  tabIndex?: number,
  target?: string,
  title?: string,

  render?: (props: LinkRendererProps) => any,
}

export interface LinkRendererProps {
  cx?: any,

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
  
  onFollow: (event: { preventDefault: () => {} }) => void,
} 


export class Link extends React.Component<LinkProps> {
  navigation: Navigation

  static defaultProps = {
    render: (props: LinkRendererProps) =>
      <AnchorLink {...props} />
  }

  static contextTypes = {
    navigation: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)

    this.navigation = this.props.env ? this.props.env.navigation : context.navigation

    // NOTE: I may want to enable this even outside of productino at some
    // point, as it can be used to pre-cache linked pages.
    if (process.env.NODE_ENV !== 'production') {
      if (!this.navigation && this.getLocation()) {
        console.warn(
          `A <Link> was created without access to a "navigation" object. `+
          `You can provide a Navigation object through an "env" prop, or via `+
          `React Context.`
        )
      }
      
      let location = this.getLocation() as Location
      if (location && location.pathname) {
        this.navigation.getPages(location.pathname).catch(() => {
          console.warn(
            `A <Link> referred to href "${location.pathname}", but the` +
            `router could not find this path.`
          )
        })
      }
    }
  }

  getLocation(): Location | undefined  {
    let href = this.props.href

    if (!href) {
      return
    }

    if (typeof href !== 'string') {
      return href
    }

    // If this is an external link, return undefined so that the native
    // response will be used.
    if (href.indexOf('://') !== -1 || href.indexOf('mailto:') === 0) {
      return
    }

    let [lhs, hash] = href.split('#')
    let [pathname, search] = lhs.split('?')
    let location = {
      pathname: pathname || ''
    } as Location
    if (search) location.search = '?' + search
    if (hash) location.hash = '#' + hash
    return location
  }

  handleFollow = (event: ({ preventDefault: () => {} })) => {
    if (this.props.disabled) {
      event.preventDefault()
      return
    }
    
    let location = this.getLocation()
    if (location) {
      event.preventDefault()
      this.navigation.pushLocation(location)
    }
  }
  
  render() {
    let {
      env,
      exact,
      href,
      render = Link.defaultProps.render,
      ...other
    } = this.props

    let linkLocation = this.getLocation()
    let navigationLocation = this.navigation.getLocation()
    let active =
      env && linkLocation &&
      (exact
        ? linkLocation.pathname === navigationLocation.pathname
        : navigationLocation.pathname.indexOf(linkLocation.pathname) === 0)

    return render({
      active: !!active,
      href: linkLocation ? createHref(linkLocation) : href as string,

      ...other,
      
      onFollow: this.handleFollow,
    })
  }
}


export class AnchorLink extends React.Component<LinkRendererProps> {
  render() {
    let { 
      active,
      activeClassName,
      activeStyle,
      className,
      disabled,
      style,
      onFollow,
      ...other
    } = this.props

    return (
      <a
        {...other}
        className={(className || '')+' '+((active && activeClassName) || '')}
        onClick={this.handleClick}
        style={Object.assign({}, style, active ? activeStyle : {})}
      />
    )
  }

  handleClick = (event) => {
    // Let the browser handle the event directly if:
    // - The user used the middle/right mouse button
    // - The user was holding a modifier key
    // - A `target` property is set (which may cause the browser to open the
    //   link in another tab)
    if (event.button === 0 &&
        !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) &&
        !this.props.target) {
          this.props.onFollow(event)
    }
  }
}
