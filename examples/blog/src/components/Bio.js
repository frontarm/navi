import React from 'react'
import styles from './Bio.module.scss'
import bioPic from './bio-pic.jpg'

class Bio extends React.Component {
  render() {
    return (
      <div className={styles.Bio}>
        <img
          src={bioPic}
          alt='James K Nelson'
        />
        <p>
          Create a blog with create-react-app, <a href="https://mdxjs.com/">MDX</a>, and <a href="https://frontarm.com/navi/">Navi</a>. <br />
          Themed after Gatsby's blog starter and Dan Abramov's <a href="https://overreacted.io/">overreacted.io</a>.
          By <a href="https://twitter.com/james_k_nelson/">James K Nelson</a>.{' '}
        </p>
      </div>
    )
  }
}

export default Bio
