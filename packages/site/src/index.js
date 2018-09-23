import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserNavigation } from 'junctions'
import { NavigationProvider } from 'react-navi'
import { rootBranch } from './rootBranch'
import { App } from './App'
import './index.css'


async function main() {
    let navigation = createBrowserNavigation({ rootJunction: rootBranch })
    
    await navigation.getSteadyState()

    let content =
        <NavigationProvider navigation={navigation}>
            <App />
        </NavigationProvider>

    // React requires us to call "hydrate" if the content already exists in
    // the DOM, which is the case for statically rendered pages.
    let node = document.getElementById('root')
    if (process.env.NODE_ENV === 'production') {
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


// Make the `rootBranch` branch and `main` function available to navi-static,
// so that it knows what to render and how to start the app.
window.$navi = {
    rootBranch: rootBranch,
    main: main
}
