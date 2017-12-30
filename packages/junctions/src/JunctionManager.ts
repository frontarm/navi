import { Deferred } from './Deferred'
import { Location, concatLocations } from './Location'
import { Mount, Junction, JunctionMount } from './Mounts'
import { MountedPattern, createRootMountedPattern, matchMountedPatternAgainstLocation } from './Patterns'
import { JunctionComponentRoute, JunctionRoute, NotFoundRoute, PageRoute, RedirectRoute, RootRoute } from './Routes'


type Listener = () => void
type Unsubscriber = () => void


// The JunctionManager class is kept as simple as possible; it does not actually handle
// navigation in the case of redirects, it doesn't expose methods to change
// history, etc. Instead, the sugar can be left to whatever package is used
// for integration with something else, e.g. React or Sitepack.
export class JunctionManager<RootJunction extends Junction<any, any, any>=any> {
    private location: Location;
    private rootMountedPattern: MountedPattern;
    private rootJunction: RootJunction;
    private rootMount?: Mount;
    private listeners: Listener[];

    onEvent: (data: { type: 'contentStart' | 'contentEnd' | 'junctionStart' | 'junctionEnd', location: Location }) => void

    constructor(options: {
        initialLocation: Location,
                
        rootJunction: RootJunction,
        rootPath?: string,

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
        this.onEvent = options.onEvent || (() => {})
        this.listeners = []
        this.rootJunction = options.rootJunction
        this.rootMountedPattern = createRootMountedPattern(options.rootJunction, options.rootPath)

        this.notifyListeners = this.notifyListeners.bind(this)

        this.setLocation(options.initialLocation)
    }
    
    getRootRoute(): RootRoute<RootJunction> {
        if (this.rootMount) {
            return (this.rootMount as JunctionMount).getRoute()
        }
    }

    getLocation(): Location {
        return this.location
    }

    isBusy() {
        if (this.rootMount) {
            return this.rootMount.isBusy()
        }
        return false
    }
    
    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Navigation state, as the state may change as new code chunks are
     * received.
     */
    subscribe(onStateChange: Listener): Unsubscriber {
        this.listeners.push(onStateChange)

        return () => {
            let index = this.listeners.indexOf(onStateChange)
            if (index !== -1) {
                this.listeners.splice(index, 1)
            }
        }
    }
    
    setLocation(location: Location): void {
        this.location = location

        // if the root pattern matches
        let match = matchMountedPatternAgainstLocation(this.rootMountedPattern, location)
        if (!match && this.rootMount) {
            this.rootMount = undefined
            this.notifyListeners()
            return
        }
        else if (match) {
            this.rootMount = new this.rootJunction({
                parentLocationPart: { pathname: '' },
                matchableLocationPart: location,
                mountedPattern: this.rootMountedPattern,
                onRouteChange: this.notifyListeners,
                junctionManager: this,
            })
            this.notifyListeners()
        }
    }

    getPageRoutes<Pathnames extends { [name: string]: string }>(pathnames: Pathnames):
        Promise<{ [K in keyof Pathnames]: PageRoute<any> | undefined }> |
        { [K in keyof Pathnames]: PageRoute<any> | undefined };
    getPageRoutes(pathname: string): Promise<PageRoute<any> | undefined> | PageRoute<any> | undefined;
    getPageRoutes<Pathnames extends { [name: string]: string } | string>(pathnames: Pathnames): any {
        // get routes for all pathnames
        // if they're redirects, follow them
    }
    
    // getJunction(location: Location): Promise<Junction> | Junction | undefined {
    //     let syncResult: any = null
    //     let promise = new Promise((resolve, reject) => {
    //         this.parseLocation(location, (node) => {
    //             if (!node) {
    //                 syncResult = undefined
    //                 reject(syncResult)
    //             }
    //             else {
    //                 let deepestNode = node
    //                 while (deepestNode.child) {
    //                     deepestNode = deepestNode.child
    //                 }

    //                 if (!deepestNode.childStatus) {
    //                     // We could parse all the way to a leaf
    //                     syncResult = this.fetchedMounts[deepestNode.mountKey].junction
    //                     resolve(syncResult)
    //                 }
    //                 else if (deepestNode.childStatus !== 'fetching') {
    //                     // Something went wrong, and we couldn't find a
    //                     // junction object for the requested location.
    //                     syncResult = undefined
    //                     reject(syncResult)
    //                 }
    //             }
    //         })
    //     })
    //     return syncResult !== null ? syncResult : promise
    // }

    private notifyListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]()
        }
    }
}
