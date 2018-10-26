import React from 'react'
import { Sidebar } from './Sidebar'
import './AppLayout.css'


const AppBusyIndicator = ({ show }) =>
    <div className={`
        App-LoadingIndicator
        App-LoadingIndicator-${show ? 'loading' : 'done'}
    `} />


export function AppLayout(props) {
  return (
    <div className="App">
      <AppBusyIndicator show={props.isBusy} />

      <div className={`App-nav ${props.isMenuOpen ? 'App-nav-open' : ''}`}>
        <Sidebar className='App-nav-sidebar' />
        <button
          className='App-nav-hamburger'
          onClick={props.onToggleMenu}>
          <div className='App-nav-hamburger-icon' />
        </button>
      </div>

      <main className="App-content">
        {props.children}
      </main>
    </div>
  )
}

