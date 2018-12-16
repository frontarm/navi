import React, { Component } from 'react';
import { NavLink, NavLoading, NavProvider, NavRoute, NavNotFoundBoundary } from 'react-navi';
import { MDXProvider } from '@mdx-js/tag';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavLoading>
          {isLoading =>
            <div className="App">
              <header className="App-header">
                <h1 className="App-title">
                  <NavLink href='/'>
                    MyApp
                  </NavLink>
                </h1>
              </header>
              <main>
                <NavNotFoundBoundary render={renderNotFound}>
                  <div
                    className={`
                      App-loading-indicator
                      ${isLoading ? 'active' : ''}
                    `}
                  />
                  <MDXProvider components={{
                    a: NavLink,
                  }}>
                    <NavRoute />
                  </MDXProvider>
                </NavNotFoundBoundary>
              </main>
            </div>
          }
        </NavLoading>
      </NavProvider>
    );
  }
}

function renderNotFound() {
  return (
    <div className='App-error'>
      <h1>404 - Not Found</h1>
    </div>
  )
} 

export default App;
