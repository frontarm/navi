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

    return (
        <div className='MDXWrapper'>
            <LoadingIndicator isLoading={page.contentStatus === 'busy'} />

            {   page.contentStatus === 'ready' &&
                <div className='MDXWrapper-ready'>
                    {React.createElement(page.content.default, {
                        factories: this.factories,
                        page: page,
                        env: env,
                    })}
                </div>
            }
            {   page.contentStatus === 'error' &&
                <div className='MDXWrapper-error'>
                    <h1>Gosh darn it.</h1>
                    <p>Something went wrong while loading the page.</p>
                </div>
            }
        </div>
    )
  }
}

const LoadingIndicator = ({ isLoading }) =>
  <div className={`
    MDXWrapper-LoadingIndicator
    MDXWrapper-LoadingIndicator-${isLoading ? 'loading' : 'done'}
  `} />