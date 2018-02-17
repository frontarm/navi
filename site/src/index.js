import React from 'react'
import ReactDOM from 'react-dom'
import { JunctionNavigation } from 'react-junctions'
import { AppJunctionTemplate } from './App'
import './index.css'


function main() {
    // The `<JunctionNavigation>` component re-renders the app each time
    // the browser's location changes.
    //
    // It renders the `component` property of the template defined in App.js,
    // passing in a `junction` prop with the app's navigatin state.
    let content =
        <JunctionNavigation
            root={AppJunctionTemplate}
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
if (process.env.NODE_ENV !== 'production') {
    main()
}


// Make the `root` template and `main` function available to junctions-static,
// so it knows what to render and how to start the app.
window.JunctionsStaticApp = {
    root: AppJunctionTemplate,
    main: main
}
