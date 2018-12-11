import * as React from 'react'
import { NavLink } from 'react-navi'
import classNames from 'classnames/bind'
import { BewareProps } from './content/Beware'
import { DemoboardProps } from './content/Demoboard'
import { DetailsProps } from './content/Details'
import { SpoilerProps } from './content/Spoiler'
import { TangentProps } from './content/Tangent'
import { VideoProps } from './content/Video'
import styles from './DocumentLayout.module.scss'

const cx = classNames.bind(styles)

export interface MDXComponents {
  [name: string]: React.ComponentType<any>
}

export interface DocumentComponents extends MDXComponents {
  wrapper: React.ComponentType<React.HTMLAttributes<any>>
  code: React.ComponentType<{ highlightedSource?: string, language?: string } & React.HTMLAttributes<any>>
  headingLink: React.ComponentType<{ href: string } & React.HTMLAttributes<any>>

  Beware: React.ComponentType<BewareProps>
  Demoboard: React.ComponentType<DemoboardProps>
  Details: React.ComponentType<DetailsProps>
  Spoiler: React.ComponentType<SpoilerProps>
  Tangent: React.ComponentType<TangentProps>
  Video: React.ComponentType<VideoProps>
}

export interface DocumentContext {
  components: DocumentComponents

  canAccessRestrictedContent: boolean
  isStatic: boolean
}

// Get around a circular dependency, where the heading components need to know
// the context, but the context needs this at creation time.
export const defaultDocumentComponents: DocumentComponents = {} as any

export const DocumentContext = React.createContext<DocumentContext>({
  components: defaultDocumentComponents,
  canAccessRestrictedContent: false,
  isStatic: true,
})

export interface DocumentProviderProps {
  children: React.ReactNode
  components: DocumentComponents
}

export function DocumentProvider(props: DocumentProviderProps) {
  return (
    <DocumentContext.Consumer>
      {context => 
        <DocumentContext.Provider value={{
          ...context,
          components: {
            ...context.components,
          }
        }}>
          {props.children}
        </DocumentContext.Provider>
      }
    </DocumentContext.Consumer>
  )
}

function createHeadingComponent(level) {
  return class Heading extends React.Component<React.HTMLAttributes<any>> {
    static contextType = DocumentContext

    render() {
      let props = this.props

      // Change MDX's heading ids by removing anything in parens, and removing
      // any <> characters.
      let simpleId = props.id && props.id.replace(/\(.*/, '').replace(/[<>]/g, '')

      // The component that will be used to render the heading's hash link.
      let HeadingLink = (this.context as DocumentContext).components.headingLink

      return React.createElement(
        'h' + level,
        { ...props, id: simpleId },
        simpleId && HeadingLink && <HeadingLink href={'#'+simpleId} />,
        props.children,
      )
    }
  }
}

Object.assign(defaultDocumentComponents, {
  a: (props) => {
    // For internal links, remove any `https` and hostname, as it triggers
    // opening in a new window.
    let href =
      props.href.indexOf(process.env.PUBLIC_URL) === 0
        ? props.href.replace(process.env.PUBLIC_URL, '')
        : props.href

    return (
      <NavLink
        {...props}
        href={href}
        // Open external links in a new window
        target={props.href.slice(0, 4) === 'http' ? '_blank' : props.target}
      />
    )
  },

  // Render the `<pre>` tags within code blocks instead of separately, so that
  // Demoboards don't need to be wrapper by `<pre>` tags.
  code: ({ children, className='', language, highlightedSource, ...props }) =>
    <pre {...props} className={cx('code')+' '+className}>
      {
        highlightedSource
          ? <code dangerouslySetInnerHTML={{ __html: highlightedSource }} />
          : <code>{children}</code>
      }
    </pre>
  ,

  h1: createHeadingComponent(1),
  h2: createHeadingComponent(2),
  h3: createHeadingComponent(3),
  h4: createHeadingComponent(4),
  h5: createHeadingComponent(5),
  h6: createHeadingComponent(6),

  // Add a class to the wrapper to add layout-related styles to it
  wrapper: ({ className='', ...props }) =>
    <div {...props} className={cx('Document', 'wrapper')+' document-wrapper '+className} />
  ,

  headingLink: ({ className='', ...props }) =>
    <NavLink href={props.href} className={'document-headingLink '+className}>
      #
    </NavLink>
  ,
  
  Beware: ({ children, className='', title, ...props }) =>
    <section {...props} className={'document-Beware '+className}>
      <header>
        {title}
      </header>
      {children}
    </section>
  ,
  Demoboard: ({ className='', id, sources, style }) =>
    <pre className={cx('document-Demoboard')+' '+className}>
      <code
        className={'document-Demoboard '+className}
        id={id}
        style={style}>
        {sources[Object.keys(sources)[0]]}
      </code>
    </pre>
  ,
  Details: ({ children, className='', title, TitleComponent, ...props }) =>
    <section {...props} className={'document-Details '+className}>
      <header>
        <TitleComponent>{title}</TitleComponent>
      </header>
      {children}
    </section>
  ,
  Spoiler: ({ children, className='', title, ...props }) =>
    <section {...props} className={'document-Spoiler '+className}>
      <header>
        {title}
      </header>
      {children}
    </section>
  ,
  Tangent: ({ children, className='', ...props }) =>
    <section {...props} className={'document-Tangent '+className}>
      {children}
    </section>
  ,
  Video: (props) =>
    <div>
      Video - todo.
    </div>
})