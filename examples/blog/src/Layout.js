import React, { Component } from 'react';
import { NavLink } from 'react-navi';
import styles from './Layout.module.css';

function Layout({ children, isLoading }) {
  return (
    <div className={styles.Layout}>
      <header>
        <LoadingIndicator isLoading={isLoading} />

        <nav>
          <NavLink href='/' activeClassName={styles.active} exact>
            Blog
          </NavLink>
          <NavLink href='/about/' activeClassName={styles.active}>
            About
          </NavLink>
          <NavLink href='/tags/' activeClassName={styles.active}>
            Tags
          </NavLink>
        </nav>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}

class LoadingIndicator extends Component {
  render() {
    return (
      <div
        // Only add the `active` class to this element while the
        // next page is loading, triggering a CSS animation to
        // show or hide the loading bar.
        className={`
          App-loading-indicator
          ${this.props.isLoading ? 'active' : ''}
        `}
      />
    )
  }
}

export default Layout