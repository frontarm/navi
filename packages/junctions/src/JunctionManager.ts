import { Junction } from './Junction'
import { Location, concatLocations } from './Location'
import { MatchNode } from './MatchNode'
import { Mount, createChildMount, emptyMount, matchMountAgainstLocation, addJunctionParamsToMount, validateChildMounts } from './Mount'


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

    private onEvent: (eventType: 'contentStart' | 'contentEnd' | 'junctionStart' | 'junctionEnd', location: Location) => void

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

    private createStateFromNode(node: MatchNode, isFetchingChildren: boolean): Junction.State {
        let details = this.fetchedMounts[node.mountKey]
        let junction = details.junction

        // If parse is complete and the deepest node has a child
        // status, then we're not at the node corresponding to the
        // requested location, so we don't need the content.
        let content: any
        let contentStatus: any | undefined
        let redirect: Location | undefined
        if (!isFetchingChildren && !node.childStatus) {
            content = details.content
            contentStatus = details.contentStatus
            if (junction.getRedirectLocation) {
                redirect = junction.getRedirectLocation(details.locators, node.location)
            }
        }

        return {
            location: node.location,
            params: node.params,
            child: node.child
                ? Object.assign(
                    this.createStateFromNode(node.child, isFetchingChildren),
                    { pattern: this.fetchedMounts[node.child.mountKey].mount.relativePattern }
                  )
                : undefined,
            childStatus: node.childStatus,

            locators: details.locators,        
            meta: junction.meta,
            content: content,
            contentStatus: contentStatus,
            redirect: redirect,
        }
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

    // the callback will be called each time we hit a promised child
    private parseLocation(location: Location, onChange: (node?: MatchNode) => void): void {
        let match = matchMountAgainstLocation(this.rootMount, location)

        // Set up a dummy node for the root, as the root has no parents.
        let dummyNode: any = {
            setChild: (node: MatchNode | string) => {
                return typeof node === 'string' ? undefined : node
            }
        }

        this.parseLocationPart(location, { pathname: '' }, this.rootMount.key, dummyNode, onChange)
    }

    // currently assumes the junction has already been fetched
    private parseLocationPart(locationPart: Location, parentLocation: Location, mountKey: string, parentNode: MatchNode, updateParentNode: (newParentNode: MatchNode) => void): void {
        let details = this.fetchedMounts[mountKey]
        let { childMounts, junction, locators, mount } = details

        // Note that we'll have already matched the *path* part of the location
        // in the parent function. However, we may not have matched params that
        // are specified by the junction, so we need to perform another match.
        let match = matchMountAgainstLocation(mount, locationPart)
        if (!match) {
            updateParentNode(parentNode.setChild('notfound'))
            return
        }

        let absoluteMatchedLocation = concatLocations(parentLocation, match.matchedLocation)
        let node = new MatchNode(absoluteMatchedLocation, mountKey, match.params)

        // If we've consumed the entire location object, then we're done!
        if (!match.remainingLocation) {
            if (junction.isIntermediate){
                updateParentNode(parentNode.setChild('notfound'))
            }
            else {
                updateParentNode(parentNode.setChild(node))
            }
            return
        }
        
        let remainingLocation = match.remainingLocation

        // Start from the beginning and take the first result, as child mounts
        // are sorted such that the first matching mount is the the most
        // precise match (and we always want to use the most precise match).
        for (let i = childMounts.length - 1; i >= 0; i--) {
            let childMount = childMounts[i]
            let match = matchMountAgainstLocation(childMount, remainingLocation)
            if (match) {        
                let fetchedDetails = this.fetchedMounts[childMount.key]
                if (fetchedDetails) {
                    // We have already fetched this mount's junction
                    this.parseLocationPart(remainingLocation, node.location, childMount.key, node, nodeWithChildren => {
                        updateParentNode(parentNode.setChild(nodeWithChildren))
                    })
                }
                else {
                    // We'll need to get the junction.
                    let details = this.unfetchedMounts[childMount.key]
                    if (details.status !== 'fetching') {
                        this.fetchJunction(childMount, concatLocations(node.location, match.matchedLocation), locators)
                    }
                    if (details.promise) {
                        updateParentNode(parentNode.setChild(node.setChild(details.status)))

                        details.promise.then(() => {
                            if (details.status !== 'error') {
                                this.parseLocationPart(remainingLocation, node.location, childMount.key, node, nodeWithChildren => {
                                    updateParentNode(parentNode.setChild(nodeWithChildren))
                                })
                            }
                            else {
                                updateParentNode(parentNode.setChild(node.setChild('error')))
                            }
                        })
                    }
                    else {
                        this.parseLocationPart(remainingLocation, node.location, childMount.key, node, nodeWithChildren => {
                            updateParentNode(parentNode.setChild(nodeWithChildren))
                        })
                    }
                }

                // The first match is always the only match, as we don't allow
                // for ambiguous patterns.
                return
            }
        }

        // Couldn't find a match for the remaining location
        updateParentNode(parentNode.setChild(node.setChild('notfound')))
    }

    private fetchJunction(mount: Mount, location: Location, parentLocators: Junction.Locators): void {
        let details = this.unfetchedMounts[mount.key]
        this.onEvent('junctionStart', location)
        let promiseOrJunction = details.loader(parentLocators, this.getJunction)
        if (promiseOrJunction && promiseOrJunction.then) {
            details.status = 'fetching'
            details.promise = promiseOrJunction.then(
                junction => {
                    // This removes the `details` entry from `unfetchedMounts`,
                    // so we don't need to update statuses.
                    this.registerJunction(mount, junction, parentLocators)
                    this.onEvent('junctionEnd', location)
                },
                error => {
                    details.status = 'error'
                    details.promise = undefined
                    this.onEvent('junctionEnd', location)
                },
            )
        }
        else {
            this.registerJunction(mount, promiseOrJunction, parentLocators)
            this.onEvent('junctionEnd', location)
        }
    }

    private fetchContent(node: MatchNode): void {
        let details = this.fetchedMounts[node.mountKey]
        if (details.junction.getContent) {
            this.onEvent('contentStart', node.location)
            let promiseOrContent = details.junction.getContent(details.locators, this.getJunction)
            if (promiseOrContent && promiseOrContent.then) {
                details.contentStatus = 'fetching'
                details.contentPromise = promiseOrContent.then(
                    content => {
                        details.content = content
                        details.contentStatus = 'fetched'
                        details.contentPromise = undefined
                        this.onEvent('contentEnd', node.location)
                    },
                    error => {
                        details.contentStatus = 'error'
                        details.contentPromise = undefined
                        this.onEvent('contentEnd', node.location)
                    }
                )
            }
            else {
                details.content = promiseOrContent
                details.contentStatus = 'fetched'
                this.onEvent('contentEnd', node.location)
            }
        }
    }

    // Register a junction, and all immediately available children.
    private registerJunction(bareMount: Mount, junction: Junction, parentLocators: Junction.Locators) {
        // Get the full mount object for this junction, including information
        // on any params that it consumes.
        let mount = addJunctionParamsToMount(bareMount, junction.params)
        
        // Get the locators object that will be used for this junction
        let locators = parentLocators
        if (junction.getLocators) {
            if (mount.params.length > 0) {
                throw new Error("You can't use `getLocators` with a junction or key that accepts parameters.")
            }
            locators = junction.getLocators(parentLocators, { pathname: mount.key })
        }

        if (junction.getContent && junction.getRedirectLocation) {
            console.error(`The junction at "${mount.relativePattern}" defines both "getContent" and "getRedirectLocation". You should only set one of these on any single junction.`)
        }

        // Remove the junction from our unfetched list, if it is there
        delete this.unfetchedMounts[mount.key]

        // Parse the patterns for our children, and warn the user if any of
        // the patterns may result in unreachable code.
        let childPatterns = junction.children ? Object.keys(junction.children) : []
        let childMounts = childPatterns.map(pattern => createChildMount(mount, pattern)).sort((x, y) => compareStrings(x.relativeKey, y.relativeKey))
        validateChildMounts(childMounts)

        // Cache junction details
        this.fetchedMounts[mount.key] = {
            mount: mount,
            junction: junction,
            locators: locators,
            content: undefined,
            contentStatus: junction.getContent ? 'fetchable' : undefined,
            childMounts: childMounts,
        }

        if (junction.children) {
            for (let i = 0; i < childMounts.length; i++) {
                let childMount = childMounts[i]
                let child = junction.children[childMount.relativePattern]

                // While our types don't allow for a raw Promise to be passed
                // in, it doesn't hurt to allow users to do so.
                if (child && (<any>child).then) {
                    let promise = child
                    child = <any>(() => promise)
                }

                if (typeof child === 'function') {
                    this.unfetchedMounts[childMount.key] = {
                        status: 'fetchable',
                        loader: child,
                    }
                }
                else if (child) {
                    this.registerJunction(childMount, child, locators)
                }
                else {
                    console.error(`No junction was provided for the pattern "${childMount.relativePattern}" (its value was "${String(child)}").`)
                }
            }
        }
    }
}

function compareStrings(a, b) {   
    return (a<b?-1:(a>b?1:0));  
}

type Unsubscriber = () => void