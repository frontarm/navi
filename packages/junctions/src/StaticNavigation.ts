import { Location } from './Location'
import { JunctionTemplate } from './JunctionTemplate'
import { Router } from './Router'
import { ContentHelpers, createContentHelpers } from './ContentHelpers'
import { Deferred } from './Deferred'
import { JunctionRoute } from './Route'
import { createRouterConfig } from './RouterConfig';


export class StaticNavigation<RootJunctionTemplate extends JunctionTemplate = JunctionTemplate> {
    private location: Location
    private router: Router<RootJunctionTemplate>
    private finalRootRouteDeferred: Deferred<JunctionRoute<RootJunctionTemplate> | undefined>
    
    constructor(options: {
        rootJunctionTemplate: RootJunctionTemplate,
        location: Location,
    }) {
        let config = createRouterConfig({
            rootJunctionTemplate: options.rootJunctionTemplate,
        })

        Object.assign(this, createContentHelpers(config))
        
        this.location = options.location
        this.finalRootRouteDeferred = new Deferred()
        this.router = new Router(config)
        this.router.subscribe(this.handleRouteChange)
        this.router.setLocation(options.location)
    }

    getPages: ContentHelpers['getPages']

    getLocation(): Location {
        return this.location
    }

    getFinalRoute(): Promise<JunctionRoute<RootJunctionTemplate> | undefined> {
        return this.finalRootRouteDeferred.promise
    }

    private handleRouteChange = () => {
        if (!this.router.isBusy()) {
            this.finalRootRouteDeferred.resolve(this.router.getRoute())
        }
    }
}
