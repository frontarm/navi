import { Location } from './Location'
import { JunctionTemplate } from './JunctionTemplate'
import { matchMountedPatternAgainstLocation } from './Patterns'
import { JunctionRoute } from './Route'
import { RouterConfig } from './RouterConfig'


type Listener = () => void
type Unsubscriber = () => void


export class Router<RootJunctionTemplate extends JunctionTemplate=any> {
    private config: RouterConfig;
    private listeners: Listener[] = []
    private location?: Location;
    private rootMatcher?: RootJunctionTemplate['prototype'];
    
    constructor(config: RouterConfig<RootJunctionTemplate>) {
        this.listeners = []
        this.config = config
    }

    getRoute(): JunctionRoute<RootJunctionTemplate> | undefined {
        return this.rootMatcher && this.rootMatcher.getRoute()
    }
    
    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * Navigation state, as the state may change as new code chunks are
     * received.
     */
    subscribe(onRouteChange: Listener): Unsubscriber {
        this.listeners.push(onRouteChange)

        return () => {
            let index = this.listeners.indexOf(onRouteChange)
            if (index !== -1) {
                this.listeners.splice(index, 1)
            }
        }
    }

    isBusy() {
        if (this.rootMatcher) {
            return this.rootMatcher.isBusy()
        }
        return false
    }
    
    setLocation(location?: Location): void {
        let locationExistenceHasChanged =
            (location && !this.location) ||
            (!location && this.location)
        
        let pathHasChanged, searchHasChanged
        if (location && this.location) {
            pathHasChanged = location.pathname !== this.location.pathname
            searchHasChanged = location.search !== this.location.search
        }

        // The router only looks at path and search, so if they haven't
        // changed, nothing else will change either.
        if (!(pathHasChanged || searchHasChanged || locationExistenceHasChanged)) {
            return
        }

        this.location = location

        let match = location && matchMountedPatternAgainstLocation(this.config.rootMountedPattern, location)
        if (!match && this.rootMatcher) {
            this.rootMatcher.willUnmount()
            this.rootMatcher = undefined
            this.notifyListeners()
            return
        }
        else if (location && match) {
            if (this.rootMatcher) {
                this.rootMatcher.willUnmount()
            }
            this.rootMatcher = new this.config.rootJunctionTemplate({
                routerConfig: this.config,
                parentLocationPart: { pathname: '' },
                matchableLocationPart: location,
                mountedPattern: this.config.rootMountedPattern,
                onChange: this.notifyListeners,
                shouldFetchContent: true,
            })
            this.notifyListeners()
        }
    }

    private notifyListeners = () => {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]()
        }
    }
}
