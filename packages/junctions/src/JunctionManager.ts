import { Deferred } from './Deferred'
import { Location, concatLocations } from './Location'
import { Mount, JunctionDefinition, JunctionMount, Definition, AsyncDefinition } from './Mounts'
import { MountedPattern, createRootMountedPattern, matchMountedPatternAgainstLocation } from './Patterns'
import { SyncNodes, RootNode, PageNode } from './Nodes'


type Listener = () => void
type Unsubscriber = () => void


// The JunctionManager class is kept as simple as possible; it does not actually handle
// navigation in the case of redirects, it doesn't expose methods to change
// history, etc. Instead, the sugar can be left to whatever package is used
// for integration with something else, e.g. React or Sitepack.
export class JunctionManager<RootJunction extends JunctionDefinition<any, any, any>=any> {
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
    
    getState(): RootNode<RootJunction> {
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
                shouldFetchContent: true,
            })
            this.notifyListeners()
        }
    }

    getPages<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: PageNode | undefined }>
    getPages(pathname: string): Promise<PageNode | undefined>;
    getPages<Pathnames extends { [name: string]: string } | string>(pathnames: Pathnames): any {
        if (typeof pathnames === 'string') {
            return this.getPageNode({ pathname: pathnames })
        }
        else {
            let keys = Object.keys(pathnames)
            let promises: Promise<PageNode | undefined>[] = []
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                promises.push(this.getPageNode({ pathname: pathnames[key] }))
            }
            return Promise.all(promises).then(values => {
                let result: { [K in keyof Pathnames]: PageNode | undefined } = {} as any
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i]
                    result[key] = values[i]
                }
                return result
            })
        }
    }

    /**
     * Return an array of PageNode objects for each child Page of the junction
     * denoted by the given path. Redirects and junctions will be excluded.
     * 
     * TODO: extend this with limit/offset options to facilitate pagination.
     */
    getJunctionPages(pathname: string): Promise<PageNode[] | undefined> {
        let deferred = new Deferred<PageNode[] | undefined>()
        this.processFinalNodeWithoutContent({ pathname }, (node?: RootNode<RootJunction>) => {
            if (!node || node.type !== 'junction') {
                deferred.resolve(undefined)
            }
            else {
                if (!node.activeDescendents) {
                    return deferred.resolve(undefined)
                }
                let deepestNode = node.activeDescendents[node.activeDescendents.length - 1]
                let definition: JunctionDefinition
                if (deepestNode.type === "redirect" && deepestNode.definition.mountableType === "Junction") {
                    definition = deepestNode.definition
                }
                else if (deepestNode.type === "junction") {
                    definition = deepestNode.definition
                }
                else {
                    return deferred.resolve(undefined)
                }
                let children = Object.entries(definition.children) as [string, Definition | AsyncDefinition][]
                let possiblePagePromises = [] as Promise<PageNode | undefined>[]
                for (let [path, page] of children) {
                    if (page.type !== "Mountable" || page.mountableType === "Page") {
                        possiblePagePromises.push(this.getPageNode(concatLocations({ pathname }, { pathname: path })))
                    }
                }
                Promise.all(possiblePagePromises).then(
                    possiblePages => {
                        deferred.resolve(possiblePages.filter(page => !!page) as PageNode[])
                    },
                    error => {
                        deferred.resolve(undefined)
                    }
                )
            }
        })
        return deferred.promise
    }

    private getPageNode(location: Location): Promise<PageNode | undefined> {
        let deferred = new Deferred<PageNode | undefined>()
        this.processFinalNodeWithoutContent(location, (node?: RootNode<RootJunction>) => {
            if (!node || node.type !== 'junction') {
                deferred.resolve(undefined)
            }
            else {
                if (!node.activeDescendents) {
                    return deferred.resolve(undefined)
                }
                let deepestNode = node.activeDescendents[node.activeDescendents.length - 1]
                if (deepestNode.type === "page") {
                    return deferred.resolve(deepestNode)
                }
                else if (deepestNode.type === "redirect") {
                    this.getPageNode(deepestNode.to).then(deferred.resolve)
                }
                else {
                    return deferred.resolve(undefined)
                }
            }
        })
        return deferred.promise
    }

    private processFinalNodeWithoutContent(location: Location, callback: (node?: RootNode<RootJunction>) => void) {
        let match = matchMountedPatternAgainstLocation(this.rootMountedPattern, location)
        if (!match) {
            callback()
        }
        else {
            let deferred = new Deferred<PageNode | undefined>()

            const handleRouteChange = () => {
                if (!rootMount.isBusy()) {
                    callback(rootMount.getRoute() as RootNode<RootJunction>)
                    rootMount.willUnmount()
                }
            }

            let rootMount = new this.rootJunction({
                parentLocationPart: { pathname: '' },
                matchableLocationPart: location,
                mountedPattern: this.rootMountedPattern,
                onRouteChange: handleRouteChange,
                junctionManager: this,
                shouldFetchContent: false,
            })

            handleRouteChange()
        }
    }

    private notifyListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]()
        }
    }
}
