import { Location, concatLocations } from './Location'
import { MatchNode } from './MatchNode'
import { createRootMountedPattern } from './Patterns'}


// The JunctionManager class is kept as simple as possible; it does not actually handle
// navigation in the case of redirects, it doesn't expose methods to change
// history, etc. Instead, the sugar can be left to whatever package is used
// for integration with something else, e.g. React or Sitepack.
export class JunctionManager<J extends Junction<L>=any, L extends Junction.Locators={}> {
    private setLocationCounter = 0
    private rootMount: Mount;
    private location: Location;
    private state?: Junction.State<J>;
    private busy: boolean;
    private listeners: ((state: Junction.State<J> | undefined, oldState: Junction.State<J> | undefined, isBusy: boolean) => void)[];

    private fetchedMounts: {
        [mountKey: string]: {
            mount: Mount,
            junction: Junction,
            locators: Junction.Locators,
            content?: any,
            contentStatus?: 'fetched' | 'fetching' | 'fetchable' | 'error',
            contentPromise?: Promise<void>,

            // Child mounts, ordered such that the first match should always
            // be the most specific match.
            childMounts: Mount[],
        }
    }
    
    private unfetchedMounts: {
        [mountKey: string]: {
            status: 'fetching' | 'fetchable' | 'error',
            loader: Junction.Loader<any, any>,
            promise?: Promise<void>,
        }
    }

    onEvent: (data: { type: 'contentStart' | 'contentEnd' | 'junctionStart' | 'junctionEnd', location: Location }) => void

    constructor(options: {
        initialLocation: Location,
                
        rootJunction: J,
        rootPath?: string,
        rootLocators?: L,

        /**
         * Allows you to be notified when junctions or content at a certain
         * path start and finish loading.
         * 
         * This is used by Sitepack to analyze which bundle chunks are required
         * for each URL, and for each junction, so that <script> tags can be added
         * to statically generated HTML, and appropriate files can be 
         * pre-emptively pushed when HTTP/2 is available.
         */
        onEvent?: JunctionManager['onEvent'],
    }) {
        this.getJunction = this.getJunction.bind(this)
        this.busy = false
        this.onEvent = options.onEvent || (() => {})
        this.listeners = []
        this.fetchedMounts = {}
        this.unfetchedMounts = {}
        this.rootMount =
            options.rootPath
                ? createChildMount(emptyMount, options.rootPath)
                : emptyMount
        
        if (this.rootMount.params.length > 0) {
            throw new Error("A JunctionManager's root path may not contain parameters")
        }

        this.registerJunction(this.rootMount, options.rootJunction, options.rootLocators || {})
        this.setLocation(options.initialLocation)
    }
    
    getState(): Junction.State<J> | undefined {
        return this.state
    }

    getLocation(): Location {
        return this.location
    }

    isBusy() {
        return this.busy
    }
    
    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Navigation state, as the state may change as new code chunks are
     * received.
     */
    subscribe(onStateChange: (state: Junction.State<J> | undefined, oldState: Junction.State<J> | undefined, isBusy: boolean) => void): Unsubscriber {
        this.listeners.push(onStateChange)

        return () => {
            let index = this.listeners.indexOf(onStateChange)
            if (index !== -1) {
                this.listeners.splice(index, 1)
            }
        }
    }
    
    getJunction(location: Location): Promise<Junction> | Junction | undefined {
        let syncResult: any = null
        let promise = new Promise((resolve, reject) => {
            this.parseLocation(location, (node) => {
                if (!node) {
                    syncResult = undefined
                    reject(syncResult)
                }
                else {
                    let deepestNode = node
                    while (deepestNode.child) {
                        deepestNode = deepestNode.child
                    }

                    if (!deepestNode.childStatus) {
                        // We could parse all the way to a leaf
                        syncResult = this.fetchedMounts[deepestNode.mountKey].junction
                        resolve(syncResult)
                    }
                    else if (deepestNode.childStatus !== 'fetching') {
                        // Something went wrong, and we couldn't find a
                        // junction object for the requested location.
                        syncResult = undefined
                        reject(syncResult)
                    }
                }
            })
        })
        return syncResult !== null ? syncResult : promise
    }

    setLocation(location: Location): void {
        let setLocationId = ++this.setLocationCounter

        this.location = location

        this.parseLocation(location, (node) => {
            // Don't keep updating state if a new location has been set.
            if (this.setLocationCounter !== setLocationId) {
                return
            }

            // Remove any state if we set a location outside of the root
            // location
            if (!node) {
                this.setState(undefined, false)
                return
            }

            // If we've completed loading everything and the deepest node
            // corresponds to the request location, then ensure that its
            // content is available
            let deepestNode = node
            while (deepestNode.child) {
                deepestNode = deepestNode.child
            }
            let deepestDetails
            if (!deepestNode.childStatus) {
                deepestDetails = this.fetchedMounts[deepestNode.mountKey]
                if (deepestDetails.contentStatus === 'fetchable' || deepestDetails.contentStatus == 'error') {
                    // `fetchContent` mutates the `details` object, setting a
                    // new status, and adding a promise if the content can't
                    // be set synchronously.
                    this.fetchContent(deepestNode)
                    if (deepestDetails.contentPromise) {
                        deepestDetails.contentPromise.then(() => {
                            if (setLocationId === this.setLocationCounter) {
                                this.setState(this.createStateFromNode(node, false), false)
                            }
                        })
                    }
                }
            }

            // Once any requised content is available (or fetching), set the
            // state.
            let fetchingChildren = deepestNode.childStatus === 'fetching'
            let fetchingContent = (deepestDetails && deepestDetails.contentStatus === 'fetching')
            this.setState(this.createStateFromNode(node, fetchingChildren), fetchingChildren || fetchingContent)
        })
    }

    private setState(state: Junction.State | undefined, isBusy: boolean) {
        let oldState = this.state
        this.busy = isBusy
        this.state = state
        for (let i = 0; i < this.listeners.length; i++) {
            let listener = this.listeners[i]
            listener(this.state, oldState, isBusy)   
        }
    }
}

type Unsubscriber = () => void