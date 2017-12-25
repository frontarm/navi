import { Location, createHref } from './Location'
import { Junction } from './Junction'
import { JunctionManager } from './JunctionManager'


type BrowserNavigationOptions = {
    /**
     * The root junction that defines the available URLs, and how to render
     * them.
     */
    rootJunction: Junction,

    /**
     * Causes the navigation to follow any redirects in junctions.
     * 
     * Defaults to `true`.
     */
    followRedirects?: boolean,

    /**
     * Adds a title announcer div for accessibility, and
     * announce the title as the user navigates.
     * 
     * You can also supply a function that reseives `pageTitlepageTitle`, and
     * returns a processed string that will be announced.
     * 
     * Defaults to `true`.
     */
    announceTitle?: boolean | ((pageTitle?: string) => string),

    /**
     * Sets `document.title` to the value of the
     * `pageTitle` property in the current junctions' meta, if it exists.
     * 
     * You can also supply a function that reseives `pageTitle`, and
     * returns a processed string that will be set.
     * 
     * Defaults to `true`.
     */
    setDocumentTitle?: boolean | ((pageTitle?: string) => string),
}


export class BrowserNavigation {
    private announceTitle?: (pageTitle?: string) => string
    private followRedirects: boolean
    private manager: JunctionManager
    private setDocumentTitle: (pageTitle?: string) => string
    private subscribers: {
        callback: () => void,
        waitForInitialContent: boolean,
    }[]
    private waitingForInitialContent: boolean
    
    constructor(options: BrowserNavigationOptions) {
        this.handleState = this.handleState.bind(this)
        this.handlePopState = this.handlePopState.bind(this)

        if (options.announceTitle !== false) {
            this.announceTitle = typeof options.announceTitle === 'function' ? options.announceTitle : ((x) => x || 'Untitled Page')

            // Add an announcer div to the DOM, if we haven't already created one
            createAnnouncerDiv()
        }
        if (options.setDocumentTitle !== false) {
            this.setDocumentTitle = typeof options.setDocumentTitle === 'function' ? options.setDocumentTitle : ((x) => x || 'Untitled Page')
        }

        this.followRedirects = options.followRedirects !== undefined ? options.followRedirects : true
        this.subscribers = []
        this.waitingForInitialContent = true

        this.manager = new JunctionManager({
            initialLocation: getWindowLocation(),
            rootJunction: options.rootJunction,
        })

        this.handleState(this.manager.getState(), undefined, this.manager.isBusy())
        this.manager.subscribe(this.handleState)
        window.addEventListener("popstate", this.handlePopState)
    }
    
    /**
     * Subscribe to new states from the Navigation object
     * @callback onChange - called when state changes
     * @argument waitForInitialContent - if try, will not be called until the initial location's content has loaded
     */
    subscribe(onChange: () => void, options: { waitForInitialContent?: boolean }={}): Unsubscriber {
        let subscriber = {
            callback: onChange,
            waitForInitialContent: !!options.waitForInitialContent,
        }

        this.subscribers.push(subscriber)

        return () => {
            let index = this.subscribers.indexOf(subscriber)
            if (index !== -1) {
                this.subscribers.splice(index, 1)
            }
        }
    }

    isBusy(): boolean {
        return this.manager.isBusy()
    }
    
    getState(): Junction.State | undefined {
        return this.manager.getState()
    }
    
    getJunction(location: Location): Promise<Junction> | Junction | undefined {
        return this.manager.getJunction(location)
    }

    getLocation(): Location {
        return this.manager.getLocation()
    }

    replaceLocation(location: Location): void {
        window.history.replaceState(location.state, <any>null, createHref(location))
        this.manager.setLocation(location)
    }

    pushLocation(location: Location): void {
        window.history.pushState(location.state, <any>null, createHref(location))
        this.manager.setLocation(location)
    }

    private handleState(newState: Junction.State | undefined, oldState: Junction.State | undefined, isBusy: boolean) {
        if (!isBusy && newState) {
            let deepestChild = newState
            while (deepestChild.child) {
                deepestChild = deepestChild.child
            }

            if (!deepestChild.childStatus) {
                if (this.followRedirects && deepestChild.redirect) {
                    this.replaceLocation(deepestChild.redirect)
                    return
                }

                let title = (deepestChild.meta && deepestChild.meta.pageTitle) || undefined
                if (this.announceTitle && !this.waitingForInitialContent) {
                    announce(this.announceTitle(title))
                }
                if (this.setDocumentTitle) {
                    document.title = this.setDocumentTitle(title)
                }

                this.waitingForInitialContent = false
            }
        }

        for (let subscriber of this.subscribers) {
            if (!isBusy || !subscriber.waitForInitialContent || !this.waitingForInitialContent) {
                subscriber.callback()
            }
        }
    }

    private handlePopState(event) {
        if (isExtraneousPopstateEvent(event)) {
            return
        }
        
        let location = getWindowLocation(event.state)
        
        this.manager.setLocation(location)
    }
}

// From a11y-toolkit, Copyright Jason Blanchard
// https://github.com/jasonblanchard/a11y-toolkit
let announcerId = 'junctions-BrowserNavigation-announcer'
let announcerTimeout
function announce(message: string, manner?) {
    let announcer = document.getElementById(announcerId)
    manner = manner || 'polite'

    if (announcer) {
        announcer.setAttribute('aria-live', 'off')
        announcer.setAttribute('aria-live', manner)
        announcer.innerHTML = message
        clearTimeout(announcerTimeout);
        announcerTimeout = setTimeout(() => {
            if (announcer) announcer.innerHTML = ''
            announcerTimeout = null
        }, 500)
    }
}

let announcerDiv
function createAnnouncerDiv() {
    if (announcerDiv) {
        return announcerDiv
    }

    announcerDiv = document.createElement('div') 
    announcerDiv.id = announcerId
    announcerDiv.setAttribute('aria-live', 'polite')

    let style = announcerDiv.style
    style.position = 'absolute'
    style.left = '-10000px'
    style.top = 'auto'
    style.width = '1px'
    style.height = '1px'
    style.overflow = 'hidden'
}


function getWindowLocation(historyState?): Location {
    let { pathname, search, hash } = window.location
    return {
        pathname,
        search,
        hash,
        state: historyState || getHistoryState(),
    }
}

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 * Taken from ReactTraining/history
 * Copyright (c) 2016-2017 React Training, under MIT license
 */
function isExtraneousPopstateEvent(event) {
    return event.state === undefined && navigator.userAgent.indexOf("CriOS") === -1
}

/**
 * Taken from ReactTraining/history
 * Copyright (c) 2016-2017 React Training, under MIT license
 */
function getHistoryState() {
    try {
        return window.history.state || {}
    } catch (e) {
        // IE 11 sometimes throws when accessing window.history.state
        // See https://github.com/ReactTraining/history/pull/289
        return {}
    }
}


type Unsubscriber = () => void