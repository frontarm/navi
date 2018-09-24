import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserNavigation } from 'junctions'
import { rootJunction } from './rootJunction'
import { App } from './App'
import './index.css'


async function main() {
    let navigation = createBrowserNavigation({ rootJunction })

    // Wait until the content is available before making the first render
    await navigation.getSteadyState()

    let content = <App navigation={navigation} />
    let node = document.getElementById('root')
    if (process.env.NODE_ENV === 'production') {
        // React requires us to call "hydrate" if the content already exists in
        // the DOM, which is the case for statically rendered pages.
    
        ReactDOM.hydrate(content, node)
    }
    else {
        ReactDOM.render(content, node)
    }
}


// When building the static version of the app, we don't want to run the
// `main` function, as there is no DOM to render to.
if (process.env.NODE_ENV !== 'production') {
    main()
}


// Make the `rooJunction` branch and `main` function available to navi-tool,
// via a global variable, so that it knows what to render and how to start
// the app.
window.$exports = {
    App,
    rootJunction,
    main,
}
