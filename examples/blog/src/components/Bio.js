import React from 'react'
import styles from './Bio.module.css'
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
          A clone of Dan Abramov's <a href="https://overreacted.io/">overreacted.io</a>{' '}
          blog using create-react-app-mdx and Navi, by{' '}
          <a href="https://mobile.twitter.com/james_k_nelson">James K Nelson</a>.
        </p>
      </div>
    )
  }
}

export default Bio