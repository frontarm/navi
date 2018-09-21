import { createBrowserHistory, UnregisterCallback, locationsAreEqual } from 'history'
import { Location, createURL, concatLocations } from './Location'
import { RoutingState } from './RoutingState'
import { Router } from './Router'
import { JunctionRoute, RouteType } from './Route'
import { Navigation } from './Navigation'


interface BrowserNavigationOptions {
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

    /**
     * If `true`, this will not scroll the user when navigating between
     * pages.
     */
    disableScrollHandling?: boolean
}


export function createBrowserNavigationSupport(
  navigation: Navigation<any>,
  options: BrowserNavigationOptions = {}
) {
  return new BrowserNavigationSupport(navigation, options)
}

type UnsubscribeCallback = () => void
type ListenWithRenderedCallback = (onRendered?: () => {}) => void

export class BrowserNavigationSupport {
    private setDocumentTitle: false | ((pageTitle: string | null) => string)
    private disableScrollHandling: boolean
    private subscribers: ListenWithRenderedCallback[]
    
    constructor(
      navigation: Navigation<any>,
      options: BrowserNavigationOptions = {}
    ) {
        if (options.setDocumentTitle !== false) {
            this.setDocumentTitle = typeof options.setDocumentTitle === 'function' ? options.setDocumentTitle : ((x) => x || 'Untitled Page')
        }
        this.disableScrollHandling = !! options.disableScrollHandling
        this.subscribers = []

        navigation.subscribe(this.handleChange)
    }

    /**
     * This is not a normal observable... it allows the subscriber
     * to let this know when its finished handling (which allows
     * this utility to wait until scrolling is complete before
     * treating it as "done")
     */
    listenWithRenderedCallback(onChange: ListenWithRenderedCallback): UnsubscribeCallback {
        this.subscribers.push(onChange)

        return () => {
            let index = this.subscribers.indexOf(onChange)
            if (index !== -1) {
                this.subscribers.splice(index, 1)
            }
        }
    }
    
    scrollToHash(hash) {
        if (hash) {
            let id = document.getElementById(hash.slice(1))
            if (id) {
                id.scrollIntoView({
                    behavior: 'instant',
                    block: 'start'
                })

                // Focus the element, as default behavior is cancelled.
                // https://css-tricks.com/snippets/jquery/smooth-scrolling/
                id.focus()
            }
        }
        else {
            window.scroll({
                top: 0, 
                left: 0, 
                behavior: 'instant' 
            })
        }
    }

    private handleChange = (nextState?: RoutingState, prevState?: RoutingState) => {
        if (nextState && nextState.lastRoute.type === RouteType.Page && this.setDocumentTitle) {
            document.title = this.setDocumentTitle(nextState.lastRoute.title)
        }
        
        // Wait until all subscribers have finished handling the changes
        // before emitting `handleLocationChange`.
        let waitCount = 0
        let decreaseWaitCount = () => {
            if (--waitCount <= 0) {
                if (nextState && nextState.isSteady) {
                    if (prevState && locationsAreEqual(nextState.location, prevState.location)) {
                        return
                    }

                    if (!this.disableScrollHandling &&
                        (!prevState ||
                        !prevState.location ||
                        prevState.location.hash !== nextState.location.hash ||
                        prevState.location.pathname !== nextState.location.pathname)
                    ) {
                        this.scrollToHash(nextState.location.hash)
                    }
                }
            }
        }

        for (let subscriber of this.subscribers) {
            if (subscriber.length > 0) {
                waitCount++
                subscriber(decreaseWaitCount as any)
            }
            else {
                subscriber()
            }
        }
        if (waitCount === 0) {
            decreaseWaitCount()
        }
    }
}
