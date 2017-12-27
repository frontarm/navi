import { Location } from './Location'
import { Junction } from './Junction'
import { JunctionManager } from './JunctionManager'


export class StaticNavigation {
    private manager: JunctionManager
    private waitingForInitialContent?: Deferred<Junction.State | undefined>
    
    constructor(options: {
        rootJunction: Junction,
        initialLocation: Location,
    }) {
        this.waitingForInitialContent = new Deferred()
        this.manager = new JunctionManager(options)

        this.handleState = this.handleState.bind(this)
        this.handleState(this.manager.getState(), undefined, this.manager.isBusy())
        this.manager.subscribe(this.handleState)
    }

    getLocation(): Location {
        return this.manager.getLocation()
    }

    getFirstCompleteState(): Promise<Junction.State | undefined> {
        if (!this.waitingForInitialContent) {
            return Promise.resolve(this.manager.getState())
        }
        else {
            return this.waitingForInitialContent.promise
        }
    }

    private handleState(newState: Junction.State | undefined, oldState: Junction.State | undefined, isBusy: boolean) {
        if (!newState && this.waitingForInitialContent) {
            this.waitingForInitialContent.resolve(undefined)
            this.waitingForInitialContent = undefined
            return
        }

        if (!isBusy && newState) {
            let deepestChild = newState
            while (deepestChild.child) {
                deepestChild = deepestChild.child
            }

            if (!deepestChild.childStatus && this.waitingForInitialContent) {
                this.waitingForInitialContent.resolve(newState)
                this.waitingForInitialContent = undefined
            }
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