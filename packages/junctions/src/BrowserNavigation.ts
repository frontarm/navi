import { Location, createHref } from './Location'
import { Template } from './Template'
import { JunctionTemplate, JunctionMatcher } from './JunctionTemplate'
import { Router } from './Router'
import { RouterConfig, createRouterConfig } from './RouterConfig'
import { ContentHelpers, createContentHelpers } from './ContentHelpers'
import { JunctionRoute } from './Route'


type BrowserNavigationOptions<RootJunctionTemplate extends JunctionTemplate = JunctionTemplate> = {
    /**
     * The root junction that defines the available URLs, and how to render
     * them.
     */
    junctionTemplate: RootJunctionTemplate,

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
    announceTitle?: boolean | ((pageTitle: string | null) => string),

    /**
     * Sets `document.title` to the value of the
     * `pageTitle` property in the current junctions' meta, if it exists.
     * 
     * You can also supply a function that reseives `pageTitle`, and
     * returns a processed string that will be set.
     * 
     * Defaults to `true`.
     */
    setDocumentTitle?: boolean | ((pageTitle: string | null) => string),
}


export class BrowserNavigation<RootJunctionTemplate extends JunctionTemplate> {
    private announceTitle?: (pageTitle: string | null) => string
    private followRedirects: boolean
    private router: Router<RootJunctionTemplate>
    private location: Location
    private setDocumentTitle: (pageTitle: string | null) => string
    private subscribers: {
        callback: () => void,
        waitForInitialContent: boolean,
    }[]
    private waitingForInitialContent: boolean

    getPages: ContentHelpers['getPages']
    getJunctionPages: ContentHelpers['getJunctionPages']
    
    constructor(options: BrowserNavigationOptions<RootJunctionTemplate>) {
        this.handleRouteChange = this.handleRouteChange.bind(this)
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

        let routerConfig = createRouterConfig({
            junctionTemplate: options.junctionTemplate
        })

        this.router = new Router(routerConfig)
        this.router.subscribe(this.handleRouteChange)

        Object.assign(this, createContentHelpers(routerConfig))
        
        this.setLocation(getWindowLocation())

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
        return this.router.isBusy()
    }
    
    getRoute(): JunctionRoute<RootJunctionTemplate> | undefined {
        return this.router.getRoute()
    }

    getLocation(): Location {
        return this.location
    }

    replaceLocation(location: Location): void {
        window.history.replaceState(location.state, <any>null, createHref(location))
        this.setLocation(location)
    }

    pushLocation(location: Location): void {
        window.history.pushState(location.state, <any>null, createHref(location))
        this.setLocation(location)
    }

    private setLocation(location: Location): void {
        this.location = location
        this.router.setLocation(location)
    }

    private handleRouteChange() {
        let isBusy = this.router.isBusy()
        let route = this.router.getRoute()
        let lastSegment = route && route[route.length - 1]

        let redirectTo: Location | undefined
        let title: string | null | undefined

        if (!isBusy && lastSegment) {
            // TODO: handle lack of trailing '/' on matched route with
            // redirect.

            title = null
            if (lastSegment.type === "redirect") {
                redirectTo = lastSegment.to
            }
            else if (lastSegment.type === "page") {
                if (lastSegment.contentStatus !== "busy") {
                    this.waitingForInitialContent = false
                }
                title = lastSegment.title
            }
            else if (lastSegment.status !== "busy") {
                this.waitingForInitialContent = false
            }
        }

        if (this.followRedirects && redirectTo) {
            this.replaceLocation(redirectTo)
            return
        }

        if (title !== undefined) {
            if (this.announceTitle) {
                announce(this.announceTitle(title))
            }
            if (this.setDocumentTitle) {
                document.title = this.setDocumentTitle(title)
            }    
        }
        
        for (let subscriber of this.subscribers) {
            if (!isBusy || !subscriber.waitForInitialContent || !this.waitingForInitialContent) {
                subscriber.callback()
            }
        }
    }

    private handlePopState(event) {
        let location = getWindowLocation(event.state)
        
        this.router.setLocation(location)
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

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 * 
 * Taken from ReactTraining/history
 * Copyright (c) 2016-2017 React Training, under MIT license
 */
export const supportsPopStateOnHashChange = () =>
  window.navigator.userAgent.indexOf("Trident") === -1



type Unsubscriber = () => void