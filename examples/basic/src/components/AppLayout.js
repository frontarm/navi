import React from 'react'
import { NavLink, NavView, NavNotFoundBoundary, useLoadingRoute } from 'react-navi';
import './AppLayout.css';

function AppLayout() {
  let loadingRoute = useLoadingRoute()

  return (
    <div className="AppLayout">
      <div
        // Only add the `active` class to this element while the
        // next page is loading, triggering a CSS animation to
        // show or hide the loading bar.
        className={`
          AppLayout-loading-indicator
          ${!!loadingRoute ? 'active' : ''}
        `}
      />
      <header className="AppLayout-header">
        <nav className="AppLayout-nav">
          <NavLink href='/' activeClassName='active' exact>
            Home
          </NavLink>
          <NavLink href='/about/' activeClassName='active'>
            About
          </NavLink>
          <NavLink href='/404/' activeClassName='active'>
            404
          </NavLink>
        </nav>
      </header>
      <main>
        <NavNotFoundBoundary render={renderNotFound}>
          <NavView />
        </NavNotFoundBoundary>
      </main>
    </div>
  )
}

// Note that create-react-navi-app will always show an error screen when this
// is called. This is because the underlying react-scripts package show
// the error screen when a NotFoundError is thrown, even though it's caught
// by <NavNotFoundBoundary>. To see the error rendered by this function,
// you'll just need to close the error overlay with the "x" at the top right.
function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
}

export default AppLayout