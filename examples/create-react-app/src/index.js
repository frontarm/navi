import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { JunctionManager } from 'junctions'

window.rootJunction = App

window.main = function main() {
    let nav = new JunctionManager({
        initialLocation: window.location,
        rootJunction: App,
        onEvent: (eventType, location) => {
            console.log(`[junctions event] ${eventType}: ${location.pathname}${location.search}`)
        }
    })

    function renderApp(navState) {
        console.log('nav state', navState)

        ReactDOM.render(
            React.createElement(navState.meta.wrapper, { nav: navState }),
            document.getElementById('root')
        )
    }

    renderApp(nav.getState())
    nav.subscribe(renderApp)
}

if (!process.env.REACT_APP_STATIC) {
    window.main()
}