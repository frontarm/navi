import { Deferred } from './Deferred'
import { Location, concatLocations } from './Location'
import { Mount, Junction, JunctionMount } from './Mounts'
import { MountedPattern, createRootMountedPattern, matchMountedPatternAgainstLocation } from './Patterns'
import { Sync, RootRoute, PageRoute } from './Routes'


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
            return (this.rootMount as JunctionMount<any, any, any>).getRoute()
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
            this.rootMount.willUnmount()
            this.rootMount = undefined
            this.notifyListeners()
            return
        }
        else if (match) {
            if (this.rootMount) {
                this.rootMount.willUnmount()
            }
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

    getPageRoutes<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: PageRoute | undefined }>
    getPageRoutes(pathname: string): Promise<PageRoute | undefined>;
    getPageRoutes<Pathnames extends { [name: string]: string } | string>(pathnames: Pathnames): any {
        if (typeof pathnames === 'string') {
            return this.getPageRoute({ pathname: pathnames })
        }
        else {
            let keys = Object.keys(pathnames)
            let promises: Promise<PageRoute | undefined>[] = []
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                promises.push(this.getPageRoute({ pathname: pathnames[key] }))
            }
            return Promise.all(promises).then(values => {
                let result: { [K in keyof Pathnames]: PageRoute | undefined } = {} as any
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i]
                    result[key] = values[i]
                }
                return result
            })
        }
    }

    private getPageRoute(location: Location): Promise<PageRoute | undefined> {
        let match = matchMountedPatternAgainstLocation(this.rootMountedPattern, location)
        if (!match) {
            return Promise.resolve(undefined)
        }
        else {
            let deferred = new Deferred<PageRoute | undefined>()

            const handleRouteChange = () => {
                if (!rootMount.isBusy()) {
                    // The root route will always be synchronous.
                    let rootRoute = rootMount.getRoute() as Sync.JunctionRoute<any, any, any, any>
                    if (!rootRoute.descendents) {
                        return deferred.resolve(undefined)
                    }
                    let deepestRoute = rootRoute.descendents[rootRoute.descendents.length - 1]
                    if (deepestRoute.type === "PageRoute") {
                        return deferred.resolve(deepestRoute)
                    }
                    else if (deepestRoute.type === "RedirectRoute") {
                        this.getPageRoute(deepestRoute.to).then(deferred.resolve)
                    }
                    else {
                        return deferred.resolve(undefined)
                    }
                }
            }

            let rootMount = new this.rootJunction({
                parentLocationPart: { pathname: '' },
                matchableLocationPart: location,
                mountedPattern: this.rootMountedPattern,
                onRouteChange: handleRouteChange,
                junctionManager: this,
            })

            handleRouteChange()

            return deferred.promise.then(route => {
                rootMount.willUnmount()
                return route
            })
        }
    }

    private notifyListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]()
        }
    }
}
