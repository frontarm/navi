import React from 'react'
import { AppNav } from './AppNav'
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

      <main className="App-content">
        {props.children}
      </main>

      <AppNav
        className='App-nav'
        pageMap={props.pageMap}
        tableOfContents={props.tableOfContents}
      />
    </div>
  )
}
