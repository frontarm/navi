import React from 'react'
import { Link } from 'react-junctions'
import './MDXWrapper.css'

// Change MDX's heading ids by removing anything in parens, and removing
// any <> characters.
function createHeadingFactory(type) {
    return ({ id, ...other }, ...children) =>
        React.createElement(type, {
            id: id.replace(/\(.*/, '').replace(/[<>]/g, ''),
            ...other,
        }, ...children)
}

export class MDXWrapper extends React.Component {
  factories = {
    a: (props, ...children) =>
        React.createElement(Link, {
            ...props,
            env: this.props.env
        }, ...children),

    h1: createHeadingFactory('h1'),
    h2: createHeadingFactory('h2'),
    h3: createHeadingFactory('h3'),
  }
 
  render() {
    let { env, page } = this.props

    if (page.contentStatus === 'busy') {
        return (
            <div className='MDXWrapper-busy'>
                <p>Reticulating splines...</p>
            </div>
        )
    }

    if (page.contentStatus === 'error') {
        return (
            <div className='MDXWrapper-error'>
                <h1>Gosh darn it.</h1>
                <p>Something went wrong.</p>
            </div>
        )
    }

    return (
        <div className='MDXWrapper-ready'>
            {React.createElement(page.content.default, {
                factories: this.factories,
                page: page,
                env: env,
            })}
        </div>
    )
  }
}