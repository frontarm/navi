import React from 'react'
import BusyIndicator from 'react-busy-indicator'
import { AppNav } from './AppNav'
import './AppLayout.css'


export function AppLayout(props) {
  return (
    <div className="App">
      <BusyIndicator isBusy={props.isBusy} />

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
