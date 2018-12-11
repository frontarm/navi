/// <reference path="./mdx-js.d.ts" />

import * as React from 'react'
import { NavLink } from 'react-navi'
import { MDXTag, MDXProvider } from '@mdx-js/tag'
import { DocumentComponents, DocumentContext } from './DocumentContext'
import { extractInlineDemoboardProps } from './extractInlineDemoboardProps'
import { shallowCompare } from './shallowCompare'

import { HideWhenStatic, HideWhenStaticProps } from './conditional/HideWhenStatic'
import { Restricted, RestrictedProps } from './conditional/Restricted'

import { Beware, BewareProps } from './content/Beware'
import { Demoboard, DemoboardProps } from './content/Demoboard'
import { Details, DetailsProps } from './content/Details'
import { Spoiler, SpoilerProps } from './content/Spoiler'
import { Tangent, TangentProps } from './content/Tangent'
import { Video, VideoProps } from './content/Video'

import { Aside, AsideProps } from './layout/Aside'
import { AsideOrAfter, AsideOrAfterProps } from './layout/AsideOrAfter'
import { Block, BlockProps } from './layout/Block'
import { FullBlock, FullBlockProps } from './layout/FullBlock'
import { WideBlock, WideBlockProps } from './layout/WideBlock'


export interface DocumentProps<DocumentComponentProps = any> {
  /**
   * The MDX Document component to render.
   */
  Component: React.ComponentType

  /**
   * Allows configuration of the components used to render different parts of
   * the document.
   */
  components?: DocumentComponents

  /**
   * Props that will be passed through to the rendered Document Component
   */
  documentProps?: DocumentComponentProps

  /**
   * Helper files that will be available to use within inline live editors
   */
  demoboardHelpers?: { [name: string]: string }

  /**
   * Magic files that will be available to the build system within all live
   * editors, without appearing as a tab.
   */
  demoboardMagicFiles?: { [name: string]: string }

  /**
   * If true, any editors/videos with the `isRestricted` attribute will be
   * usable
   */
  canAccessRestrictedContent?: boolean

  /**
   * If true, any nested `<HideWhenStatic>` blocks will not be shown.
   */
  isStatic?: boolean

  className?: string
  style?: React.CSSProperties,
  id?: string
}

/**
 * A component that wraps an MDX Document function, maintaining a table of
 * contents and the current position within the document. It also allows
 * scrolling within the document by hash.
 */
export class Document extends React.Component<DocumentProps> {
  static HideWhenStatic = HideWhenStatic
  static Restricted = Restricted

  static Beware = Beware
  static Demoboard = Demoboard
  static Details = Details
  static Spoiler = Spoiler
  static Tangent = Tangent
  static Video = Video

  static Aside = Aside
  static AsideOrAfter = AsideOrAfter
  static Block = Block
  static FullBlock = FullBlock
  static WideBlock = WideBlock

  static contextType = DocumentContext

  renderCode = ({ dangerouslySetInnerHTML: html, children, ...props }) => {
    let { __html: highlightedSource } = html || { __html: children }
    let el = document.createElement('pre')
    el.innerHTML = highlightedSource
    let source = el.innerText

    // TODO: match live editors in the raw highlighted source, and extract
    // the first file's highlighted source, so it can be displayed after
    // page load until the editor is loaded.

    let fenceString = props.className ? props.className.replace(/^language-/, '') : null
    let bracketIndex = fenceString && fenceString.indexOf('{')
    let language = fenceString && (bracketIndex === -1 ? fenceString : fenceString.slice(0, bracketIndex))

    let demoboardProps = extractInlineDemoboardProps(source, highlightedSource, this.props.demoboardHelpers)

    return (
      demoboardProps
        ? <Demoboard {...demoboardProps} />
        : React.createElement(this.context.components.code, {
          ...props,
          highlightedSource,
          language,
        })
    )
  }

  // Live editors don't need to be wrapped in a <pre>, so leave rendering
  // this up to the code renderer.
  renderPre = (props) => {
    let PreComponent = this.context.components.pre || 'pre'

    return (
      props.children && props.children.type === MDXTag && props.children.props.name === 'code'
        ? props.children
        : <PreComponent {...props} />
    )
  }

  renderWrapper = (props) =>
    React.createElement(this.context.components.wrapper, {
      ...props,
      className: this.props.className,
      id: this.props.id,
      style: this.props.style,
    })

  // Documents can be pretty heavy, and should be pure,
  // so we want to avoid re-rendering them where possible.
  shouldComponentUpdate(nextProps: DocumentProps) {
    let lastProps = this.props

    return (
      lastProps.Component !== nextProps.Component ||
      lastProps.canAccessRestrictedContent !== nextProps.canAccessRestrictedContent ||
      lastProps.className !== nextProps.className ||
      !shallowCompare(lastProps.documentProps, nextProps.documentProps) ||
      !shallowCompare(lastProps.demoboardHelpers, nextProps.demoboardHelpers) ||
      lastProps.id !== nextProps.id ||
      lastProps.isStatic !== nextProps.isStatic ||
      !shallowCompare(lastProps.style, nextProps.style)
    )
  }

  render() {
    // Separate our custom components from the MDX components
    let components = {
      ...(this.context as DocumentContext).components,
      ...this.props.components!,
    }
    
    let {
      wrapper,
      code,
      headingLink,

      Beware,
      Demoboard,
      Details,
      Spoiler,
      Tangent,
      Video,

      ...mdxComponents
    } = components

    // Add in hard-coded MDX components to handle code blocks and pass through
    // styling props
    mdxComponents.code = this.renderCode
    mdxComponents.pre = this.renderPre
    mdxComponents.wrapper = this.renderWrapper

    return (
      <DocumentContext.Provider value={{
        canAccessRestrictedContent: !!this.props.canAccessRestrictedContent,
        components,
        isStatic: !!this.props.isStatic,
      }}>
        <MDXProvider components={mdxComponents}>
          <this.props.Component {...this.props.documentProps} />
        </MDXProvider>
      </DocumentContext.Provider>
    )
  }
}