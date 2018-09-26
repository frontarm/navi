import React from 'react'
import { Link } from 'react-navi'
import './MDXWrapper.css'


function createHeadingFactory(type) {
    return ({ id, ...other }, ...children) => {
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
            ...children,

            // Append a hash link to each heading, which will be hidden via
            // CSS until he mouse hovers over the heading.
            <Link className='MDXWrapper-heading-link' href={'#'+simpleId}>#</Link>
        )
    }
}


export class MDXWrapper extends React.Component {
  factories = {
    a: (props, ...children) => React.createElement(Link, props, ...children),

    h1: createHeadingFactory('h1'),
    h2: createHeadingFactory('h2'),
    h3: createHeadingFactory('h3'),
    h4: createHeadingFactory('h4'),
    h5: createHeadingFactory('h5'),
    h6: createHeadingFactory('h6'),
  }

  render() {
    let { document } = this.props

    return (
        <div className='MDXWrapper'>
            {React.createElement(document, {
                factories: this.factories,
            })}
        </div>
    )
  }
}
