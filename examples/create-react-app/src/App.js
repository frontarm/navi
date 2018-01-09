import React, { Component } from 'react'
import { createJunctionTemplate, createPageTemplate, createRedirectTemplate } from 'junctions'
import { JunctionComponent, Link } from 'react-junctions'
import logo from './logo.svg'
import './App.css'


export default createJunctionTemplate(({ split }) => ({
  children: {
    '/users': split(() => import('./Users').then(m => m.default)),

    '/old-users': createRedirectTemplate('/users/'),

    '/': createPageTemplate({
      title: 'Junctions Example',
      component: function() {
        return <div>Welcome!</div>
      }
    }) 
  },

  component:
    class App extends Component {
      render() {
        let junction = this.props.junction
    
        return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Welcome to React</h1>
              <Link href="https://reactarmory.com">Go to React Armory</Link>
            </header>
    
            <Link href="/users/">View users</Link>
            <Link href="/old-users/">Old page</Link>
    
            <JunctionComponent junction={junction} />
          </div>
        );
      }
    },
}))
