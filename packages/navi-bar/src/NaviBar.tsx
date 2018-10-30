import * as React from 'react'
import * as Navi from 'navi'
import { NavConsumer, NavLink } from 'react-navi'
import { URLDescriptor } from 'navi'
import { defaultTheme } from './defaultTheme'
import { Item, ItemType, getItems } from './items'
import { Anchor } from './Anchor'
import { ScrollSpy } from './ScrollSpy'

export type TableOfContents = TableOfContentsItem[]

export interface TableOfContentsItem {
  id
  level: number
  title: React.ReactNode
  children: TableOfContents
}

export interface NaviBarProps<PageMeta = any, SwitchMeta = any> {
  // TODO: once React Suspense works for server side rendering,
  // it'll be possible to pass in a URL and use the router to
  // generate the PageMap automatically.
  pageMap?: Navi.PageMap

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
   * If specified, this will be run on each group of pages/switches to
   * determine its order
   */
  comparator?: (x: Item, y: Item) => -1 | 0 | 1

  renderSwitch?: (
    options: RenderSwitchOptions<SwitchMeta>,
  ) => React.ReactElement<any> | null
  renderPage?: (
    options: RenderPageOptions<PageMeta>,
  ) => React.ReactElement<any> | null
  renderHeading?: (
    options: RenderHeadingOptions,
  ) => React.ReactElement<any> | null
}

export interface RenderSwitchOptions<Meta = any> {
  active: boolean
  children: React.ReactNode
  href: string
  level: number
  meta: Meta
  index: number
  title?: string
}

export interface RenderPageOptions<Meta = any> {
  active: boolean
  children: React.ReactNode
  href: string
  meta: Meta
  index: number
  title: string
}

export interface RenderHeadingOptions {
  active: boolean

  // TODO
  descendantActive: boolean

  children: React.ReactNode
  id: string
  level: number
  index: number
  title: React.ReactNode
}

export namespace NaviBar {
  export type Props = NaviBarProps
}

export const NaviBar = Object.assign(
  function NaviBar<PageMeta, SwitchMeta>(props: NaviBarProps<PageMeta, SwitchMeta>) {
    return (
      <ScrollSpy tableOfContents={props.tableOfContents || []}>
        {({id, parentIds}) =>
          <NavConsumer>
            {nav =>
              <InnerNaviBar
                activeURL={nav.url} {...props}
                activeId={id}
                activeParentIds={parentIds || []}
              />
            }
          </NavConsumer>
        }
      </ScrollSpy>
    )
  },
  {
    Anchor: Anchor,
    defaultProps: defaultTheme
  }
)

export interface InnerNaviBarProps<PageMeta, SwitchMeta>
  extends NaviBarProps<PageMeta, SwitchMeta> {
  activeURL: Navi.URLDescriptor
  activeId?: string
  activeParentIds: string[]
}

export interface InnerNaviBarState {}

export class InnerNaviBar<PageMeta, SwitchMeta> extends React.Component<
  InnerNaviBarProps<PageMeta, SwitchMeta>,
  InnerNaviBarState
> {
  activePageRef = React.createRef<HTMLAnchorElement>()

  render() {
    if (!this.props.pageMap) {
      return this.renderTableOfContents()
    }

    let items = getItems(this.props.pageMap, this.props.comparator)
    if (items.length === 0) {
      return null
    }
    return items.map(this.renderItem)
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
        <NavLink href={'#' + heading.id} key={heading.id} render={renderChildren}>
          {headingContent}
        </NavLink>
      )
    )
  }

  renderItem = (item: Item, index: number) => {
    let active =
      this.props.activeURL.pathname.indexOf(item.url.pathname) === 0 &&
      (item.type === 'switch' || Math.abs(this.props.activeURL.pathname.length - item.url.pathname.length) <= 1)

    if (item.type === ItemType.Page) {
      let pageContent = this.props.renderPage!({
        active,
        children: active ? this.renderTableOfContents() : null,
        href: item.url.href,
        meta: item.meta,
        index: index,
        title: item.title,
      })

      return (
        pageContent && (
          <NavLink
            href={item.url.href}
            key={item.url.href}
            ref={active ? this.activePageRef : undefined}
            render={renderChildren}>
            {pageContent}
          </NavLink>
        )
      )
    } else {
      let childElements = item.children.map(this.renderItem)
      let switchContent = this.props.renderSwitch!({
        active,
        children: childElements.length ? childElements : null,
        href: item.url.href,
        level: item.level,
        meta: item.meta,
        index: index,
        title: item.title,
      })

      return (
        switchContent &&
        React.cloneElement(switchContent, { key: item.url.pathname })
      )
    }
  }

  componentDidMount() {
    if (this.props.scrollToActive) {
      let node = this.activePageRef.current
      if (node) {
        node.scrollIntoView({
          behavior: 'instant',
          block: 'center',
        })
      }
    }
  }

  componentDidUpdate(prevProps: InnerNaviBarProps<PageMeta, SwitchMeta>) {
    if (
      this.props.scrollToActive &&
      this.props.activeURL.pathname !== prevProps.activeURL.pathname
    ) {
      let node = this.activePageRef.current
      if (node) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
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
function renderChildren(props: NavLink.RendererProps) {
  return props.children
}