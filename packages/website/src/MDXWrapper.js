import React from 'react'
import { NavLink } from 'react-navi'
import './MDXWrapper.scss'


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
                className: 'MDXWrapper-heading', 
                ...other,
            },
            children,

            // Append a hash link to each heading, which will be hidden via
            // CSS until he mouse hovers over the heading.
            <NavLink className='MDXWrapper-heading-link' href={'#'+simpleId}>#</NavLink>
        )
    }
}

export class MDXWrapper extends React.Component {
  components = {
    a: NavLink,

    h1: createHeadingFactory('h1'),
    h2: createHeadingFactory('h2'),
    h3: createHeadingFactory('h3'),
    h4: createHeadingFactory('h4'),
    h5: createHeadingFactory('h5'),
    h6: createHeadingFactory('h6'),

    inlineCode: (props) => <code {...props} />,
    code: ({ children, metaString, ...props }) => <code {...props}>{children}</code>,
  }

  render() {
    let { document } = this.props
    // let tableOfContents = document.tableOfContents()

    return (
        <div className='MDXWrapper'>
            {React.createElement(document, {
                components: this.components,
            })}
        </div>
    )
  }
}
