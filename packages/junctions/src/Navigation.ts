// import { Location } from './Location'
// import { History } from 'history'
// import { Junction } from './Junction'
// import { JunctionRoute } from './Route'
// import { ContentHelpers } from './ContentHelpers'
// import { Router } from './Router';

// type Listener = (state: { location, url, route }) => void
// type Unsubscriber = () => void

// export class Navigation<RootJunction extends Junction=any> {
//     history: History
//     listeners: Listener[]
//     router: Router<RootJunction>

//     constructor(history: History, router: Router<RootJunction>) {
//         this.history = history
//         this.router = router
//     }

//     /**
//      * Get the root route
//      */
//     getCurrentRoute(): JunctionRoute<RootJunction> | undefined {
        
//     }
    
//     /**
//      * If you're using code splitting, you'll need to subscribe to changes to
//      * Navigation state, as the state may change as new code chunks are
//      * received.
//      */
//     subscribe(onRouteChange: Listener): Unsubscriber {
//         this.listeners.push(onRouteChange)

//         return () => {
//             let index = this.listeners.indexOf(onRouteChange)
//             if (index !== -1) {
//                 this.listeners.splice(index, 1)
//             }
//         }
//     }

//     isBusy() {
//         // TODO: compute this from the current route
//         if (this.rootMatcher) {
//             return this.rootMatcher.isBusy()
//         }
//         return false
//     }
    
//     // TODO: instead of handling this here, subscribe to the history
//     // object and observe that.
//     setLocation(location?: Location): void {
//         let locationExistenceHasChanged =
//             (location && !this.location) ||
//             (!location && this.location)
        
//         let pathHasChanged, searchHasChanged
//         if (location && this.location) {
//             pathHasChanged = location.pathname !== this.location.pathname
//             searchHasChanged = location.search !== this.location.search
//         }

//         // The router only looks at path and search, so if they haven't
//         // changed, nothing else will change either.
//         if (!(pathHasChanged || searchHasChanged || locationExistenceHasChanged)) {
//             this.notifyListeners()
//             return
//         }

//         this.location = location

//         let match = location && matchMountedPatternAgainstLocation(this.config.rootMountedPattern, location)
//         if (!match && this.rootMatcher) {
//             this.rootMatcher.willUnmount()
//             this.rootMatcher = undefined
//             this.notifyListeners()
//             return
//         }
//         else if (location && match) {
//             if (this.rootMatcher) {
//                 this.rootMatcher.willUnmount()
//             }
//             this.rootMatcher = new this.config.rootJunctionTemplate({
//                 routerConfig: this.config,
//                 parentLocationPart: { pathname: '' },
//                 matchableLocationPart: location,
//                 mountedPattern: this.config.rootMountedPattern,
//                 onChange: this.notifyListeners,
//                 shouldFetchContent: true,
//             })
//             this.notifyListeners()
//         }
//     }

//     private notifyListeners = () => {
//         for (let i = 0; i < this.listeners.length; i++) {
//             this.listeners[i]()
//         }
//     }
// }