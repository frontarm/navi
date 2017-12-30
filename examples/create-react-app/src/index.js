import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserNavigation } from 'junctions'

window.rootJunction = App

window.main = function main({ isStatic }) {
    let nav = new BrowserNavigation({
        rootJunction: App,
        waitForInitialContent: true,
    })

    function renderApp() {
        let rootRoute = nav.getRootRoute()
        ReactDOM.render(
            React.createElement(rootRoute.component, { route: rootRoute }),
            document.getElementById('root')
        )
    }

    // Wait until the navigation has loaded all required files
    if (!nav.isBusy()) {
        renderApp()
    }
    nav.subscribe(renderApp, { waitForInitialContent: true })
}

if (!process.env.REACT_APP_STATIC) {
    window.main({ isStatic: false })
}