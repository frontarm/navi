import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserNavigation } from 'junctions'

function main() {
    let nav = new BrowserNavigation({
        rootJunctionTemplate: App,
        waitForInitialContent: true,
    })

    function renderApp() {
        let route = nav.getRoute()
        let junction = route[0]
        ReactDOM.render(
            React.createElement(junction.component, { junction }),
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
    main()
}

window.ReactApp = {
    rootJunctionTemplate: App,
    main: main
}