import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { JunctionNavigation } from 'react-junctions'
import './index.css'


function main() {
    // The `<JunctionNavigation>` component re-renders the app each time
    // the browser's location changes.
    //
    // It renders the `component` property of the template defined in App.js,
    // passing in two props:
    //
    // - route: an array of junction, page or redirect objects corresponding
    //          to the different parts of the current URL)
    // - env:   an object containing "location" and "navigation" objects, by
    //          which you can access and change the current location.
    let content =
        <JunctionNavigation
            id='navigation'
            root={App}
            waitForInitialContent
        />

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
if (!process.env.REACT_APP_STATIC) {
    main()
}


// Make the `root` template and `main` function available to junctions-static,
// so it knows what to render and how to start the app.
window.JunctionsStaticApp = {
    root: App,
    main: main
}