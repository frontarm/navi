import { Location } from './Location'
export const StaticNavigation = null
// import { JunctionDefinition } from './Mounts'
// import { JunctionManager } from './JunctionTemplateManager'
// import { RootNode } from './Nodes'
// import { Deferred } from './Deferred'


// export class StaticNavigation<RootJunction extends JunctionDefinition<any, any, any>> {
//     private manager: JunctionManager<RootJunction>
//     private finalRootRouteDeferred: Deferred<RootNode<RootJunction>>
    
//     constructor(options: {
//         rootJunction: RootJunction,
//         initialLocation: Location,
//         onEvent?: JunctionManager['onEvent'],
//     }) {
//         this.manager = new JunctionManager(options)
//         this.finalRootRouteDeferred = new Deferred()

//         this.getPages = this.manager.getPages.bind(this.manager)

//         if (this.manager.isBusy()) {
//             this.handleRouteChange = this.handleRouteChange.bind(this)
//             this.manager.subscribe(this.handleRouteChange)
//         }
//         else {
//             this.finalRootRouteDeferred.resolve(this.manager.getState())
//         }
//     }

//     getLocation(): Location {
//         return this.manager.getLocation()
//     }

//     getPages: JunctionManager['getPages']

//     getFinalState(): Promise<RootNode<RootJunction>> {
//         return this.finalRootRouteDeferred.promise
//     }

//     private handleRouteChange() {
//         if (!this.manager.isBusy()) {
//             this.finalRootRouteDeferred.resolve(this.manager.getState())
//         }
//     }
// }
