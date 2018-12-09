import React from 'react'
import { NavContentSegment, NavLink } from 'react-navi'
import { StickyContainer, Sticky } from 'react-sticky'
import { MDXProvider } from '@mdx-js/tag'
import classNames from 'classnames/bind'
import { Nav } from './Nav'
import styles from './Layout.module.scss'

const cx = classNames.bind(styles)

export class Layout extends React.Component {
  constructor(props) {
    super(props)
    
    this.mdxComponents = {
      a: NavLink,

      h1: createHeadingFactory('h1'),
      h2: createHeadingFactory('h2'),
      h3: createHeadingFactory('h3'),
      h4: createHeadingFactory('h4'),
      h5: createHeadingFactory('h5'),
      h6: createHeadingFactory('h6'),

      wrapper: props => <div className={cx('MDXWrapper')}>{props.children}</div>,

      inlineCode: (props) => <code {...props} />,
      code: ({ children, metaString, ...props }) => <code {...props}>{children}</code>,

      ...props.components,
    }
  }

  render() {
    return (
      <NavContentSegment>
        {({ route }) => {
          let tableOfContents =
            route &&
            route.content &&
            route.content.tableOfContents &&
            route.content.tableOfContents()

          return (
            <StickyContainer className={cx("App")}>
              <Sticky disableCompensation disableHardwareAcceleration>
                {({ style: { width, ...style } }) =>
                  <Nav
                    className={cx('nav')}
                    style={{
                      position: 'absolute',
                      ...style,
                    }}
                    pageMap={this.props.siteMap.pages}
                    rootPathname={this.props.rootPathname}
                    tableOfContents={tableOfContents}
                    renderToggle={({onToggleOpen, isOpen}) =>
                      <button
                        className={cx('hamburger')}
                        onClick={onToggleOpen}>
                        <div className={cx('icon')} />
                      </button>
                    }
                  />
                }
              </Sticky>

              <main className={cx("content")}>
                <MDXProvider components={this.mdxComponents}>
                  {route && <route.content.Component/>}
                </MDXProvider>
              </main>
            </StickyContainer>
          )
        }}
      </NavContentSegment>
    )
  }
}


function createHeadingFactory(type) {
  return ({ id, children, ...other }) => {
      // Change MDX's heading ids by removing anything in parens, and removing
      // any <> characters, as otherwise the API Reference's ids can get a
      // little weird.
      let simpleId = id.replace(/\(.*/, '').replace(/[<>]/g, '')
      return React.createElement(
          type,
          {
              id: simpleId,
              className: styles.heading,
              ...other,
          },
          children,

          // Append a hash link to each heading, which will be hidden via
          // CSS until he mouse hovers over the heading.
          <NavLink className={cx('hash-link')} href={'#'+simpleId}>#</NavLink>
      )
  }
}