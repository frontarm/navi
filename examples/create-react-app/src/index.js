import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { JunctionNavigation } from 'react-junctions'


function main() {
    let node = document.getElementById('root')
    let content = 
        <JunctionNavigation
            id='app'
            root={App}
            waitForInitialContent
        />
    
    if (process.env.NODE_ENV === 'production') {
        ReactDOM.hydrate(content, node)
    }
    else {
        ReactDOM.render(content, node)
    }
}


if (!process.env.REACT_APP_STATIC) {
    main()
}


window.ReactApp = {
    rootJunctionTemplate: App,
    main: main
}