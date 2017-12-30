import { Location } from './Location'
import { Junction } from './Mounts'
import { JunctionManager } from './JunctionManager'
import { RootRoute } from './Routes'


export class StaticNavigation<RootJunction extends Junction<any, any, any>> {
    private manager: JunctionManager<RootJunction>
    private finalRootRouteDeferred: Deferred<RootRoute<RootJunction>>
    
    constructor(options: {
        rootJunction: RootJunction,
        initialLocation: Location,
    }) {
        this.manager = new JunctionManager(options)
        this.finalRootRouteDeferred = new Deferred()

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

    getFinalRootRoute(): Promise<RootRoute<RootJunction>> {
        return this.finalRootRouteDeferred.promise
    }

    private handleRouteChange() {
        if (!this.manager.isBusy()) {
            this.finalRootRouteDeferred.resolve(this.manager.getRootRoute())
        }
    }
}


class Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;

    constructor() {
        this.promise = new Promise(function(resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
    }
}