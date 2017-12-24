import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'


class App extends Component {
  render() {
    let nav = this.props.nav

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <a href="/users">View users</a>
        
        {
          nav.child &&
          React.createElement(nav.child.meta.wrapper, { nav: nav.child })
        }
      </div>
    );
  }
}


export default {
  meta: {
    title: 'Junctions Example',
    wrapper: App,
  },

  children: {
    '/users': () => import('./Users').then(m => m.default),
    '/old-users': {
      getRedirectLocation: () => ({ pathname: '/users' })
    }
  },
}
