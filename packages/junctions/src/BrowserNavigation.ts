import { createBrowserHistory, History } from 'history'
import { Location, createHref, concatLocations } from './Location'
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
    rootJunctionTemplate: RootJunctionTemplate,

    /**
     * Whether to follow any redirects in the current route.
     * 
     * Defaults to `true`.
     */
    followRedirects?: boolean,

    /**
     * Causes changes in the location's hash or pathname to scroll page to the
     * new hash, or to the top.
     * 
     * Defaults to `true`.
     */
    autoscroll?: boolean,

    /**
     * You can supply a History object, as produced by the `history` package.
     * 
     * This is useful for integrating Junctions-based components within a
     * react-router based app.
     */
    history?: History,

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
    private autoscroll: boolean
    private followRedirects: boolean
    private router: Router<RootJunctionTemplate>
    private location: Location
    private history: History
    private setDocumentTitle: (pageTitle: string | null) => string
    private subscribers: {
        callback: () => void,
        waitForInitialContent: boolean,
    }[]
    private waitingForInitialContent: boolean

    getPages: ContentHelpers['getPages']
    getJunctionPages: ContentHelpers['getJunctionPages']
    
    constructor(options: BrowserNavigationOptions<RootJunctionTemplate>) {
        if (options.announceTitle !== false) {
            this.announceTitle = typeof options.announceTitle === 'function' ? options.announceTitle : ((x) => x || 'Untitled Page')

            // Add an announcer div to the DOM, if we haven't already created one
            createAnnouncerDiv()
        }
        if (options.setDocumentTitle !== false) {
            this.setDocumentTitle = typeof options.setDocumentTitle === 'function' ? options.setDocumentTitle : ((x) => x || 'Untitled Page')
        }

        // if ('scrollRestoration' in window.history) {
        //     // Prevent the browser from automatically scrolling on popState.
        //     window.history.scrollRestoration = 'manual'
        // }

        this.autoscroll = options.autoscroll !== undefined ? options.autoscroll : true
        this.followRedirects = options.followRedirects !== undefined ? options.followRedirects : true
        this.subscribers = []
        this.waitingForInitialContent = true

        this.history = options.history || createBrowserHistory()
        this.history.listen(this.handleHistoryChange)

        // Store the previous location, so we can see if the hash has changed
        this.location = this.history.location

        let routerConfig = createRouterConfig({
            rootJunctionTemplate: options.rootJunctionTemplate
        })

        this.router = new Router(routerConfig)
        this.router.subscribe(this.handleRouteChange)

        Object.assign(this, createContentHelpers(routerConfig))
        
        this.router.setLocation(this.history.location)
    }
    
    /**
     * Subscribe to new states from the Navigation object
     * @callback onChange - called when state changes
     * @argument waitForInitialContent - if try, will not be called until the initial location's content has loaded
     */
    subscribe(onChange: () => void, options: { waitForInitialContent?: boolean }={}): UnsubscribeCallback {
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

    /**
     * Returns the current location on the internal `history` object.
     * 
     * Use this over calling `history.location` directly to make it
     * clearer that the location can change, without warning when
     * the `navigation` object is passed as a prop.
     */
    getLocation(): Location {
        return this.history.location
    }

    replaceLocation(location: Location);
    replaceLocation(path: string, state?: any);
    replaceLocation(location: any, state?): void {
        this.history.replace(location, state)
    }

    pushLocation(location: Location);
    pushLocation(path: string, state?: any);
    pushLocation(location: any, state?: any): void {
        this.history.push(location, state)
    }

    scrollToHash(hash) {
        console.log('scrollToHash', hash)
    }

    private handleHistoryChange = (location) => {
        let previousLocation = this.location
        this.location = location
        this.router.setLocation(location)
        if (!this.router.isBusy() && 
            (previousLocation.hash !== this.location.hash ||
            (!this.location.hash && previousLocation.pathname !== this.location.pathname))
        ) {
            this.scrollToHash(this.location.hash)
        }
    }

    private handleRouteChange = () => {
        let isBusy = this.router.isBusy()
        let route = this.router.getRoute()
        let lastSegment = route && route[route.length - 1]

        let redirectTo: Location | undefined
        let title: string | null | undefined

        if (!isBusy && lastSegment) {
            if (lastSegment.type === "page" && this.history.location.pathname.substr(-1) !== '/') {
                redirectTo = concatLocations(this.history.location, { pathname: '/' })
            }

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


type UnsubscribeCallback = () => void