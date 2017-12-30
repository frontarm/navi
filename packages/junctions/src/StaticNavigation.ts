import { Location } from './Location'
import { Junction } from './Mounts'
import { JunctionManager } from './JunctionManager'
import { RootRoute } from './Routes'
import { Deferred } from './Deferred'


export class StaticNavigation<RootJunction extends Junction<any, any, any>> {
    private manager: JunctionManager<RootJunction>
    private finalRootRouteDeferred: Deferred<RootRoute<RootJunction>>
    
    constructor(options: {
        rootJunction: RootJunction,
        initialLocation: Location,
        onEvent?: JunctionManager['onEvent'],
    }) {
        this.manager = new JunctionManager(options)
        this.finalRootRouteDeferred = new Deferred()

        this.getPageRoutes = this.manager.getPageRoutes.bind(this.manager)

        if (this.manager.isBusy()) {
            this.handleRouteChange = this.handleRouteChange.bind(this)
            this.manager.subscribe(this.handleRouteChange)
        }
        else {
            this.finalRootRouteDeferred.resolve(this.manager.getRootRoute())
        }
    }

    getLocation(): Location {
        return this.manager.getLocation()
    }

    getPageRoutes: JunctionManager['getPageRoutes']

    getFinalRootRoute(): Promise<RootRoute<RootJunction>> {
        return this.finalRootRouteDeferred.promise
    }

    private handleRouteChange() {
        if (!this.manager.isBusy()) {
            this.finalRootRouteDeferred.resolve(this.manager.getRootRoute())
        }
    }
}
