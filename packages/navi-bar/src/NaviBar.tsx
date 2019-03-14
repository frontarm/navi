import * as React from 'react'
import * as Navi from 'navi'
import { Link, useCurrentRoute } from 'react-navi'
import { defaultTheme } from './defaultTheme'
import { Item, getItems } from './items'
import { Anchor } from './Anchor'
import { CloseOverlay, CloseOverlayContext } from './CloseOverlay'
import { useScrollSpy } from './useScrollSpy'
import { TableOfContents, TableOfContentsItem } from './TableOfContents'


export interface NaviBarProps<Data extends object = any> {
  routeMap?: Navi.RouteMap<Navi.Route<Data>>

  /**
   * A table of contents to display for the current document.
   */
  tableOfContents?: TableOfContents

  /**
   * The id of the currently visible heading within the table of contents.
   */
  activeId?: string

  /**
   * If true, keep the component scrolled to the current active
   * item as it changes. Useful when the navbar has its own scrollbar.
   */
  scrollToActive?: boolean

  /**
   * If specified, this will be run on each group of pages/groups to
   * determine its order
   */
  comparator?: (x: Item, y: Item) => -1 | 0 | 1

  render?: (
    options: NaviBarRendererProps
  ) => React.ReactElement<any> | null
  renderSection?: (
    options: NaviBarSectionRendererProps<Data>,
  ) => React.ReactElement<any> | null
  renderPage?: (
    options: NaviBarPageRendererProps<Data>,
  ) => React.ReactElement<any> | null
  renderHeading?: (
    options: NaviBarHeadingRendererProps,
  ) => React.ReactElement<any> | null
}

export interface NaviBarRendererProps {
  children: React.ReactNode
  open: boolean
  toggleOpen: () => void,
}

export interface NaviBarSectionRendererProps<Data = any> {
  active: boolean
  children: React.ReactNode
  href: string
  level: number
  data: Data
  index: number
  title?: string
}

export interface NaviBarPageRendererProps<Data = any> {
  active: boolean
  children: React.ReactNode
  href: string
  data: Data
  index: number
  title: string
}

export interface NaviBarHeadingRendererProps {
  active: boolean
  descendantActive: boolean
  children: React.ReactNode
  id: string
  level: number
  index: number
  title: React.ReactNode
}

export namespace NaviBar {
  export type Props = NaviBarProps

  export type RendererProps = NaviBarRendererProps
  export type PageRendererProps<Data extends object = any> = NaviBarPageRendererProps<Data>
  export type SectionRendererProps<Data extends object = any> = NaviBarSectionRendererProps<Data>
  export type HeadingRendererProps = NaviBarHeadingRendererProps
}

export const NaviBar = Object.assign(
  function NaviBar<Data extends object = any>(props: NaviBarProps<Data>) {
    let { id, parentIds } = useScrollSpy({
      tableOfContents: props.tableOfContents!
    })
    let route = useCurrentRoute()

    return (
      <InnerNaviBar
        activeURL={route.url} {...props}
        activeId={id}
        activeParentIds={parentIds || []}
      />
    )
  },
  {
    Anchor: Anchor,
    CloseOverlay: CloseOverlay,
    defaultProps: defaultTheme
  }
)

export interface InnerNaviBarProps<Data extends object = any>
  extends NaviBarProps<Data> {
  activeURL: Navi.URLDescriptor
  activeId?: string
  activeParentIds: string[]
}

export interface InnerNaviBarState {
  open: boolean,
  toggleOpen: () => void,
}

export class InnerNaviBar<Data extends object = any> extends React.Component<
  InnerNaviBarProps<Data>,
  InnerNaviBarState
> {
  activePageRef = React.createRef<HTMLAnchorElement>()

  constructor(props: InnerNaviBarProps<Data>) {
    super(props) 

    this.state = {
      open: false,
      toggleOpen: this.toggleOpen,
    }
  }

  toggleOpen = () => {
    this.setState(state => ({
      open: !state.open,
    }))
  }

  render() {
    let children: React.ReactNode = null
    if (!this.props.routeMap) {
      children = this.renderTableOfContents()
    }
    else {
      let items = getItems(this.props.routeMap, this.props.comparator)
      if (items.length !== 0) {
        children = items.map(this.renderItem)
      }
    }
    return (
      <CloseOverlayContext.Provider value={this.state}>
        {this.props.render!({ children, ...this.state })}
      </CloseOverlayContext.Provider>
    )
  }

  renderTableOfContents() {
    let headings = getHeadings(this.props.tableOfContents)
    let headingElements = headings.map(this.renderHeading)
    return headingElements.length ? headingElements : null
  }

  renderHeading = (heading: TableOfContentsItem, index: number) => {
    let childElements = heading.children && heading.children.map(this.renderHeading)
    let headingContent = this.props.renderHeading!({
      active: this.props.activeId === heading.id,
      descendantActive: this.props.activeParentIds.indexOf(heading.id) !== -1,
      children: childElements.length ? childElements : null,
      id: heading.id,
      level: heading.level,
      index: index,
      title: heading.title,
    })

    return (
      headingContent && (
        <Link href={'#' + heading.id} key={heading.id} render={renderChildren}>
          {headingContent}
        </Link>
      )
    )
  }

  renderItem = (item: Item, index: number) => {
    let active =
      this.props.activeURL.pathname.indexOf(item.url.pathname) === 0 &&
      (item.type === 'group' || Math.abs(this.props.activeURL.pathname.length - item.url.pathname.length) <= 1)

    if (item.type === 'page') {
      let pageContent = this.props.renderPage!({
        active,
        children: active ? this.renderTableOfContents() : null,
        href: item.url.href,
        data: item.data,
        index: index,
        title: item.title,
      })

      return (
        pageContent && (
          <Link
            href={item.url.href}
            key={item.url.href}
            ref={active ? this.activePageRef : undefined}
            render={renderChildren}>
            {pageContent}
          </Link>
        )
      )
    } else {
      let childElements = item.children.map(this.renderItem)
      let groupContent = this.props.renderSection!({
        active,
        children: childElements.length ? childElements : null,
        href: item.url.href,
        level: item.level,
        data: item.data,
        index: index,
        title: item.title,
      })

      return (
        groupContent &&
        React.cloneElement(groupContent, { key: item.url.pathname })
      )
    }
  }

  componentDidMount() {
    if (this.props.scrollToActive) {
      let node = this.activePageRef.current
      if (node) {
        node.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        })
      }
    }
  }

  componentDidUpdate(prevProps: InnerNaviBarProps<Data>) {
    if (this.props.activeURL.pathname !== prevProps.activeURL.pathname) {
      if (this.props.scrollToActive) {
        let node = this.activePageRef.current
        if (node) {
          node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }

      if (this.state.open) {
        this.setState({
          open: false
        })
      }
    }
  }
}


// Get the highest level group of headings that has more than one item
function getHeadings(toc?: TableOfContents): TableOfContents {
  if (toc) {
    if (toc.length === 1) {
      if (toc[0].level === 1) {
        return getHeadings(toc[0].children)
      }
    } else if (toc.length > 1) {
      return toc
    }
  }
  return []
}

// Renderer for <NavLink> elements
function renderChildren(props: Link.RendererProps) {
  return props.children
}