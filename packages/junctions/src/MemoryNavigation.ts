import { Location } from './Location'
import { Junction } from './Junction'
import { JunctionManager } from './JunctionManager'


export class MemoryNavigation {
    private manager: JunctionManager
    private subscribers: {
        callback: () => void,
        waitForInitialContent: boolean,
    }[]
    private waitingForInitialContent: boolean
    
    constructor(options: {
        rootJunction: Junction,
        initialLocation: Location,
    }) {
        this.handleState = this.handleState.bind(this)

        this.subscribers = []
        this.waitingForInitialContent = true
        this.manager = new JunctionManager(options)

        this.handleState(this.manager.getState(), undefined, this.manager.isBusy())
        this.manager.subscribe(this.handleState)
    }

    /**
     * Subscribe to new states from the Navigation object
     * @callback onChange - called when state changes
     * @argument waitForInitialContent - if try, will not be called until the initial location's content has loaded
     */
    subscribe(onChange: () => void, options: { waitForInitialContent?: boolean }={}): Unsubscriber {
        let subscriber = {
            callback: onChange,
            waitForInitialContent: !!options.waitForInitialContent,
        }

        this.subscribers.push(subscriber)

        return () => {
            let index = this.subscribers.indexOf(subscriber)
            if (index !== -1) {
                this.subscribers.splice(index, 1)
            }
        }
    }

    isBusy(): boolean {
        return this.manager.isBusy()
    }
    
    getState(): Junction.State | undefined {
        return this.manager.getState()
    }
    
    getJunction(location: Location): Promise<Junction> | Junction | undefined {
        return this.manager.getJunction(location)
    }

    getLocation(): Location {
        return this.manager.getLocation()
    }

    replaceLocation(location: Location): void {
        this.manager.setLocation(location)
    }

    pushLocation(location: Location): void {
        this.manager.setLocation(location)
    }

    private handleState(newState: Junction.State | undefined, oldState: Junction.State | undefined, isBusy: boolean) {
        if (!isBusy && newState) {
            let deepestChild = newState
            while (deepestChild.child) {
                deepestChild = deepestChild.child
            }

            if (!deepestChild.childStatus) {
                this.waitingForInitialContent = false
            }
        }

        for (let subscriber of this.subscribers) {
            if (!isBusy || !subscriber.waitForInitialContent || !this.waitingForInitialContent) {
                subscriber.callback()
            }
        }
    }
}


type Unsubscriber = () => void